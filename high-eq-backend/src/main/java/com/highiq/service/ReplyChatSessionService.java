package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.AdoptChatSuggestionRequest;
import com.highiq.dto.CreateReplyChatSessionRequest;
import com.highiq.dto.GenerateChatSuggestionsRequest;
import com.highiq.dto.GenerateChatSuggestionsResponse;
import com.highiq.dto.PageResponse;
import com.highiq.dto.ReplyChatMessageDTO;
import com.highiq.dto.ReplyChatSessionDTO;
import com.highiq.dto.ReplyChatSessionListItemDTO;
import com.highiq.dto.ReplyChatSuggestionDTO;
import com.highiq.entity.History;
import com.highiq.entity.ProfileChatHistory;
import com.highiq.entity.ProfileReplySuggestion;
import com.highiq.entity.ReplyChatMessage;
import com.highiq.entity.ReplyChatSession;
import com.highiq.entity.ReplyChatSuggestion;
import com.highiq.entity.ReplySuggestion;
import com.highiq.enums.AiModel;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.ProfileChatHistoryMapper;
import com.highiq.mapper.ProfileReplySuggestionMapper;
import com.highiq.mapper.ReplyChatMessageMapper;
import com.highiq.mapper.ReplyChatSessionMapper;
import com.highiq.mapper.ReplyChatSuggestionMapper;
import com.highiq.mapper.ReplySuggestionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReplyChatSessionService extends ServiceImpl<ReplyChatSessionMapper, ReplyChatSession> {

    private static final int MAX_TURN_COUNT = 100;
    private static final int WARN_TURN_COUNT = 85;
    private static final int MAX_CONTEXT_MESSAGES = 16;
    private static final int MAX_MESSAGE_LENGTH = 500;
    private static final int MAX_INTENT_LENGTH = 300;
    private static final int MAX_SUMMARY_LENGTH = 1200;

    private final HistoryMapper historyMapper;
    private final ReplySuggestionMapper replySuggestionMapper;
    private final ProfileChatHistoryMapper profileChatHistoryMapper;
    private final ProfileReplySuggestionMapper profileReplySuggestionMapper;
    private final ReplyChatMessageMapper messageMapper;
    private final ReplyChatSuggestionMapper suggestionMapper;
    private final AiService aiService;
    private final QwenVisionService qwenVisionService;
    private final DoubaoVisionService doubaoVisionService;
    private final QuotaService quotaService;

    public ReplyChatSessionService(
            HistoryMapper historyMapper,
            ReplySuggestionMapper replySuggestionMapper,
            ProfileChatHistoryMapper profileChatHistoryMapper,
            ProfileReplySuggestionMapper profileReplySuggestionMapper,
            ReplyChatMessageMapper messageMapper,
            ReplyChatSuggestionMapper suggestionMapper,
            AiService aiService,
            QwenVisionService qwenVisionService,
            DoubaoVisionService doubaoVisionService,
            QuotaService quotaService) {
        this.historyMapper = historyMapper;
        this.replySuggestionMapper = replySuggestionMapper;
        this.profileChatHistoryMapper = profileChatHistoryMapper;
        this.profileReplySuggestionMapper = profileReplySuggestionMapper;
        this.messageMapper = messageMapper;
        this.suggestionMapper = suggestionMapper;
        this.aiService = aiService;
        this.qwenVisionService = qwenVisionService;
        this.doubaoVisionService = doubaoVisionService;
        this.quotaService = quotaService;
    }

    @Transactional
    public ReplyChatSessionDTO createSession(String userId, CreateReplyChatSessionRequest request) {
        SourceContext source = requireSourceContext(userId, request.getHistoryId(), request.getSuggestionId());
        String sentReply = trimAndLimit(request.getSentReply(), MAX_MESSAGE_LENGTH, "发送内容");
        if (sentReply == null || sentReply.isBlank()) {
            sentReply = source.suggestionContent();
        }

        String sessionId = UUID.randomUUID().toString();
        ReplyChatSession session = ReplyChatSession.builder()
                .id(sessionId)
                .userId(userId)
                .historyId(request.getHistoryId())
                .sourceSuggestionId(request.getSuggestionId())
                .roleBackground(source.roleBackground())
                .initialChatContent(source.chatContent())
                .initialUserIntent(source.userIntent())
                .tone(ReplyStyleLabelParser.DEFAULT_STYLE_LABEL)
                .modelPreference(source.modelUsed())
                .sessionSummary("")
                .turnCount(1)
                .maxTurnCount(MAX_TURN_COUNT)
                .warnTurnCount(WARN_TURN_COUNT)
                .messageCount(2)
                .status("active")
                .build();
        baseMapper.insert(session);

        insertMessage(sessionId, "opponent", source.chatContent(), "initial", null, 0);
        insertMessage(sessionId, "user", sentReply, "ai_adopted", request.getSuggestionId(), 1);
        return getSession(userId, sessionId);
    }

    public ReplyChatSessionDTO getSession(String userId, String sessionId) {
        ReplyChatSession session = requireSession(userId, sessionId);
        return toSessionDTO(session, listMessages(sessionId), listLatestSuggestions(sessionId));
    }

    public PageResponse<ReplyChatSessionListItemDTO> listSessions(String userId, Integer page, Integer size) {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;
        int offset = (page - 1) * size;

        QueryWrapper<ReplyChatSession> countWrapper = new QueryWrapper<>();
        countWrapper.eq("user_id", userId);
        Long total = baseMapper.selectCount(countWrapper);

        QueryWrapper<ReplyChatSession> dataWrapper = new QueryWrapper<>();
        dataWrapper.eq("user_id", userId)
                .orderByDesc("update_time")
                .orderByDesc("create_time")
                .last("LIMIT " + offset + ", " + size);
        List<ReplyChatSessionListItemDTO> items = baseMapper.selectList(dataWrapper).stream()
                .peek(this::normalizeSessionLimit)
                .map(this::toListItemDTO)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) total / size);
        return PageResponse.<ReplyChatSessionListItemDTO>builder()
                .items(items)
                .totalPages(totalPages)
                .total(total)
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    @Transactional
    public GenerateChatSuggestionsResponse generateSuggestions(String userId, String sessionId, GenerateChatSuggestionsRequest request) {
        ReplyChatSession session = requireActiveSession(userId, sessionId);
        if (session.getTurnCount() != null && session.getTurnCount() >= session.getMaxTurnCount()) {
            throw new RuntimeException("这段继续聊已经到达上限，可以重新开启一段新的继续聊");
        }

        String chatImage = trimToNull(request.getChatImage());
        String opponentMessage = trimAndLimit(request.getOpponentMessage(), MAX_MESSAGE_LENGTH, "对方消息");
        if (opponentMessage == null && chatImage == null) {
            throw new RuntimeException("对方说了什么不能为空");
        }
        String userIntent = trimAndLimit(request.getUserIntent(), MAX_INTENT_LENGTH, "真实想法");
        String requestedModel = request.getModelPreference() != null && !request.getModelPreference().isBlank()
                ? request.getModelPreference()
                : defaultModel(session.getModelPreference());
        AiModel model = AiModel.fromId(requestedModel);
        if (chatImage != null && !model.isSupportsImage()) {
            throw new RuntimeException("上传聊天截图需要选择支持截图的模型");
        }
        checkModelAndQuota(userId, requestedModel);

        int nextTurnIndex = (session.getTurnCount() == null ? 0 : session.getTurnCount()) + 1;
        List<ReplyChatSuggestionDTO> suggestions;
        ReplyChatMessage opponent;
        if (chatImage != null) {
            ContinueChatGeneration generation = generateFromScreenshot(session, requestedModel, opponentMessage,
                    chatImage, userIntent, collectExcludedContents(sessionId, request.getExcludeSuggestionIds()));
            String summary = trimAndLimit(generation.opponentSummary(), MAX_MESSAGE_LENGTH, "对方说了什么");
            if (summary == null) {
                summary = opponentMessage != null ? opponentMessage : "已根据聊天截图识别对方说了什么";
            }
            opponent = insertMessage(sessionId, "opponent", summary, "screenshot_summary", null, nextTurnIndex);
            suggestions = saveSuggestions(session, opponent, generation.suggestions());
        } else {
            opponent = insertMessage(sessionId, "opponent", opponentMessage, "manual", null, nextTurnIndex);
            suggestions = createSuggestionsForMessage(session, opponent, requestedModel, userIntent,
                    collectExcludedContents(sessionId, request.getExcludeSuggestionIds()));
        }
        session.setMessageCount(defaultInt(session.getMessageCount()) + 1);
        session.setModelPreference(requestedModel);
        refreshSessionSummary(session);
        baseMapper.updateById(session);

        return GenerateChatSuggestionsResponse.builder()
                .sessionId(sessionId)
                .turnCount(session.getTurnCount())
                .maxTurnCount(session.getMaxTurnCount())
                .warnTurnCount(session.getWarnTurnCount())
                .opponentMessageId(opponent.getId())
                .suggestions(suggestions)
                .build();
    }

    @Transactional
    public GenerateChatSuggestionsResponse regenerateLatestSuggestions(String userId, String sessionId, GenerateChatSuggestionsRequest request) {
        ReplyChatSession session = requireActiveSession(userId, sessionId);
        ReplyChatMessage latestOpponent = latestOpponentMessage(sessionId);
        if (latestOpponent == null) {
            throw new RuntimeException("暂无可换一批的对方消息");
        }

        String userIntent = request == null ? null : trimAndLimit(request.getUserIntent(), MAX_INTENT_LENGTH, "真实想法");
        String requestedModel = request != null && request.getModelPreference() != null && !request.getModelPreference().isBlank()
                ? request.getModelPreference()
                : defaultModel(session.getModelPreference());
        checkModelAndQuota(userId, requestedModel);

        List<String> excludeContents = collectExcludedContents(sessionId, request == null ? null : request.getExcludeSuggestionIds());
        List<ReplyChatSuggestionDTO> suggestions = createSuggestionsForMessage(session, latestOpponent, requestedModel, userIntent, excludeContents);
        session.setModelPreference(requestedModel);
        baseMapper.updateById(session);

        return GenerateChatSuggestionsResponse.builder()
                .sessionId(sessionId)
                .turnCount(session.getTurnCount())
                .maxTurnCount(session.getMaxTurnCount())
                .warnTurnCount(session.getWarnTurnCount())
                .opponentMessageId(latestOpponent.getId())
                .suggestions(suggestions)
                .build();
    }

    @Transactional
    public ReplyChatSessionDTO adoptSuggestion(String userId, String sessionId, AdoptChatSuggestionRequest request) {
        ReplyChatSession session = requireActiveSession(userId, sessionId);
        ReplyChatSuggestion suggestion = suggestionMapper.selectById(request.getSuggestionId());
        if (suggestion == null || !sessionId.equals(suggestion.getSessionId())) {
            throw new RuntimeException("回复建议不存在");
        }
        if (session.getTurnCount() != null && session.getTurnCount() >= session.getMaxTurnCount()) {
            throw new RuntimeException("这段继续聊已经到达上限，可以重新开启一段新的继续聊");
        }

        String finalContent = trimAndLimit(request.getFinalContent(), MAX_MESSAGE_LENGTH, "发送内容");
        if (finalContent == null) {
            throw new RuntimeException("发送内容不能为空");
        }
        int nextTurnIndex = defaultInt(session.getTurnCount()) + 1;
        insertMessage(sessionId, "user", finalContent, "ai_adopted", suggestion.getId(), nextTurnIndex);

        suggestion.setIsAdopted(1);
        suggestionMapper.updateById(suggestion);

        session.setTurnCount(nextTurnIndex);
        session.setMessageCount(defaultInt(session.getMessageCount()) + 1);
        if (nextTurnIndex >= session.getMaxTurnCount()) {
            session.setStatus("completed");
        }
        baseMapper.updateById(session);
        return getSession(userId, sessionId);
    }

    @Transactional
    public void deleteSession(String userId, String sessionId) {
        requireSession(userId, sessionId);

        QueryWrapper<ReplyChatSuggestion> suggestionWrapper = new QueryWrapper<>();
        suggestionWrapper.eq("session_id", sessionId);
        suggestionMapper.delete(suggestionWrapper);

        QueryWrapper<ReplyChatMessage> messageWrapper = new QueryWrapper<>();
        messageWrapper.eq("session_id", sessionId);
        messageMapper.delete(messageWrapper);

        baseMapper.deleteById(sessionId);
    }

    private List<ReplyChatSuggestionDTO> createSuggestionsForMessage(ReplyChatSession session, ReplyChatMessage opponent,
                                                                     String requestedModel, String userIntent,
                                                                     List<String> excludeContents) {
        List<ReplyChatMessage> messages = listMessages(session.getId());
        List<String> recentMessages = messages.stream()
                .skip(Math.max(0, messages.size() - MAX_CONTEXT_MESSAGES))
                .map(message -> ("opponent".equals(message.getRole()) ? "对方：" : "我：") + message.getContent())
                .collect(Collectors.toList());

        List<String> aiSuggestions = aiService.generateContinueChatReplies(
                session.getRoleBackground(),
                session.getInitialChatContent(),
                session.getInitialUserIntent(),
                session.getSessionSummary(),
                recentMessages,
                opponent.getContent(),
                userIntent,
                requestedModel,
                excludeContents
        );

        return saveSuggestions(session, opponent, aiSuggestions);
    }

    private List<ReplyChatSuggestionDTO> saveSuggestions(ReplyChatSession session, ReplyChatMessage opponent,
                                                         List<String> suggestions) {
        int batchIndex = nextBatchIndex(session.getId());
        List<ReplyChatSuggestionDTO> result = new ArrayList<>();
        for (int i = 0; i < Math.min(suggestions.size(), AiService.DEFAULT_REPLY_COUNT); i++) {
            ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(suggestions.get(i));
            ReplyChatSuggestion suggestion = ReplyChatSuggestion.builder()
                    .id(UUID.randomUUID().toString())
                    .sessionId(session.getId())
                    .afterMessageId(opponent.getId())
                    .content(parsed.content())
                    .reason(parsed.reason())
                    .tone(ReplyStyleLabelParser.DEFAULT_STYLE_LABEL)
                    .styleLabel(parsed.styleLabel())
                    .batchIndex(batchIndex)
                    .orderIndex(i + 1)
                    .isAdopted(0)
                    .build();
            suggestionMapper.insert(suggestion);
            result.add(toSuggestionDTO(suggestion));
        }
        return result;
    }

    private ContinueChatGeneration generateFromScreenshot(ReplyChatSession session, String requestedModel,
                                                          String opponentMessage, String chatImage,
                                                          String userIntent, List<String> excludeContents) {
        List<ReplyChatMessage> messages = listMessages(session.getId());
        List<String> recentMessages = messages.stream()
                .skip(Math.max(0, messages.size() - MAX_CONTEXT_MESSAGES))
                .map(message -> ("opponent".equals(message.getRole()) ? "对方：" : "我：") + message.getContent())
                .collect(Collectors.toList());
        if (AiModel.QWEN3_VL_PLUS.getId().equals(requestedModel)) {
            return qwenVisionService.generateContinueChatWithImage(chatImage, opponentMessage, session.getRoleBackground(),
                    session.getInitialChatContent(), session.getInitialUserIntent(), session.getSessionSummary(),
                    recentMessages, userIntent, excludeContents);
        }
        if (AiModel.DOUBAO_SEED_2_PRO.getId().equals(requestedModel)) {
            return doubaoVisionService.generateContinueChatWithImage(chatImage, opponentMessage, session.getRoleBackground(),
                    session.getInitialChatContent(), session.getInitialUserIntent(), session.getSessionSummary(),
                    recentMessages, userIntent, excludeContents);
        }
        throw new RuntimeException("当前模型暂不支持聊天截图识别");
    }

    private SourceContext requireSourceContext(String userId, String historyId, String suggestionId) {
        History history = historyMapper.selectById(historyId);
        if (history != null && userId.equals(history.getUserId()) && defaultInt(history.getStatus()) == 1) {
            ReplySuggestion suggestion = replySuggestionMapper.selectById(suggestionId);
            if (suggestion == null || !historyId.equals(suggestion.getHistoryId())) {
                throw new RuntimeException("回复建议不存在");
            }
            return new SourceContext(history.getChatContent(), history.getRoleBackground(), history.getUserIntent(),
                    history.getModelUsed(), ReplyStyleLabelParser.parse(suggestion.getSuggestionText()).content());
        }

        ProfileChatHistory profileHistory = profileChatHistoryMapper.selectById(historyId);
        if (profileHistory != null && userId.equals(profileHistory.getUserId()) && defaultInt(profileHistory.getStatus()) == 1) {
            ProfileReplySuggestion suggestion = profileReplySuggestionMapper.selectById(suggestionId);
            if (suggestion == null || !historyId.equals(suggestion.getHistoryId())) {
                throw new RuntimeException("回复建议不存在");
            }
            return new SourceContext(profileHistory.getChatContent(), profileHistory.getRoleBackground(),
                    profileHistory.getUserIntent(), profileHistory.getModelUsed(),
                    ReplyStyleLabelParser.parse(suggestion.getSuggestionText()).content());
        }

        throw new RuntimeException("历史记录不存在");
    }

    private ReplyChatSession requireSession(String userId, String sessionId) {
        ReplyChatSession session = baseMapper.selectById(sessionId);
        if (session == null || !userId.equals(session.getUserId())) {
            throw new RuntimeException("继续聊会话不存在");
        }
        normalizeSessionLimit(session);
        return session;
    }

    private void normalizeSessionLimit(ReplyChatSession session) {
        boolean changed = false;
        if (session.getMaxTurnCount() == null || session.getMaxTurnCount() < MAX_TURN_COUNT) {
            session.setMaxTurnCount(MAX_TURN_COUNT);
            changed = true;
        }
        if (session.getWarnTurnCount() == null || session.getWarnTurnCount() < WARN_TURN_COUNT) {
            session.setWarnTurnCount(WARN_TURN_COUNT);
            changed = true;
        }
        if (changed) {
            baseMapper.updateById(session);
        }
    }

    private ReplyChatSession requireActiveSession(String userId, String sessionId) {
        ReplyChatSession session = requireSession(userId, sessionId);
        if (!"active".equals(session.getStatus())) {
            throw new RuntimeException("这段继续聊已结束，可以重新开启一段新的继续聊");
        }
        return session;
    }

    private ReplyChatMessage insertMessage(String sessionId, String role, String content, String source,
                                           String sourceSuggestionId, int turnIndex) {
        ReplyChatMessage message = ReplyChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .role(role)
                .content(content)
                .source(source)
                .sourceSuggestionId(sourceSuggestionId)
                .turnIndex(turnIndex)
                .build();
        messageMapper.insert(message);
        return message;
    }

    private List<ReplyChatMessage> listMessages(String sessionId) {
        QueryWrapper<ReplyChatMessage> wrapper = new QueryWrapper<>();
        wrapper.eq("session_id", sessionId)
                .orderByAsc("turn_index")
                .orderByAsc("create_time");
        return messageMapper.selectList(wrapper);
    }

    private List<ReplyChatSuggestion> listLatestSuggestions(String sessionId) {
        int latestBatch = nextBatchIndex(sessionId) - 1;
        if (latestBatch <= 0) {
            return List.of();
        }
        QueryWrapper<ReplyChatSuggestion> wrapper = new QueryWrapper<>();
        wrapper.eq("session_id", sessionId)
                .eq("batch_index", latestBatch)
                .orderByAsc("order_index");
        return suggestionMapper.selectList(wrapper);
    }

    private ReplyChatMessage latestOpponentMessage(String sessionId) {
        QueryWrapper<ReplyChatMessage> wrapper = new QueryWrapper<>();
        wrapper.eq("session_id", sessionId)
                .eq("role", "opponent")
                .orderByDesc("turn_index")
                .orderByDesc("create_time")
                .last("LIMIT 1");
        return messageMapper.selectOne(wrapper);
    }

    private List<String> collectExcludedContents(String sessionId, List<String> suggestionIds) {
        QueryWrapper<ReplyChatSuggestion> wrapper = new QueryWrapper<>();
        wrapper.eq("session_id", sessionId);
        if (suggestionIds != null && !suggestionIds.isEmpty()) {
            wrapper.in("id", suggestionIds);
        }
        return suggestionMapper.selectList(wrapper).stream()
                .map(ReplyChatSuggestion::getContent)
                .filter(content -> content != null && !content.isBlank())
                .collect(Collectors.toList());
    }

    private int nextBatchIndex(String sessionId) {
        QueryWrapper<ReplyChatSuggestion> wrapper = new QueryWrapper<>();
        wrapper.eq("session_id", sessionId)
                .orderByDesc("batch_index")
                .last("LIMIT 1");
        ReplyChatSuggestion latest = suggestionMapper.selectOne(wrapper);
        return latest == null || latest.getBatchIndex() == null ? 1 : latest.getBatchIndex() + 1;
    }

    private void checkModelAndQuota(String userId, String requestedModel) {
        if (!quotaService.isModelAvailable(userId, requestedModel)) {
            throw new RuntimeException("当前订阅级别不支持使用 " + requestedModel + " 模型，请升级到 PRO 版本");
        }
        if (!quotaService.checkAndConsumeQuota(userId, requestedModel)) {
            throw new RuntimeException("今日点数不足，请切换低消耗模型或升级会员");
        }
    }

    private ReplyChatSessionDTO toSessionDTO(ReplyChatSession session, List<ReplyChatMessage> messages,
                                             List<ReplyChatSuggestion> latestSuggestions) {
        return ReplyChatSessionDTO.builder()
                .id(session.getId())
                .historyId(session.getHistoryId())
                .sourceSuggestionId(session.getSourceSuggestionId())
                .roleBackground(session.getRoleBackground())
                .initialChatContent(session.getInitialChatContent())
                .initialUserIntent(session.getInitialUserIntent())
                .modelPreference(session.getModelPreference())
                .turnCount(session.getTurnCount())
                .maxTurnCount(session.getMaxTurnCount())
                .warnTurnCount(session.getWarnTurnCount())
                .status(session.getStatus())
                .messages(messages.stream().map(this::toMessageDTO).collect(Collectors.toList()))
                .latestSuggestions(latestSuggestions.stream().map(this::toSuggestionDTO).collect(Collectors.toList()))
                .build();
    }

    private ReplyChatMessageDTO toMessageDTO(ReplyChatMessage message) {
        return ReplyChatMessageDTO.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .source(message.getSource())
                .turnIndex(message.getTurnIndex())
                .createTime(message.getCreateTime())
                .build();
    }

    private ReplyChatSuggestionDTO toSuggestionDTO(ReplyChatSuggestion suggestion) {
        return ReplyChatSuggestionDTO.builder()
                .id(suggestion.getId())
                .content(suggestion.getContent())
                .reason(suggestion.getReason())
                .styleLabel(suggestion.getStyleLabel())
                .isAdopted(suggestion.getIsAdopted())
                .build();
    }

    private ReplyChatSessionListItemDTO toListItemDTO(ReplyChatSession session) {
        ReplyChatMessage latest = latestMessage(session.getId());
        return ReplyChatSessionListItemDTO.builder()
                .id(session.getId())
                .roleBackground(session.getRoleBackground())
                .initialChatContent(session.getInitialChatContent())
                .latestMessage(latest == null ? session.getInitialChatContent() : latest.getContent())
                .turnCount(session.getTurnCount())
                .maxTurnCount(session.getMaxTurnCount())
                .status(session.getStatus())
                .createTime(session.getCreateTime())
                .updateTime(session.getUpdateTime())
                .build();
    }

    private ReplyChatMessage latestMessage(String sessionId) {
        QueryWrapper<ReplyChatMessage> wrapper = new QueryWrapper<>();
        wrapper.eq("session_id", sessionId)
                .orderByDesc("turn_index")
                .orderByDesc("create_time")
                .last("LIMIT 1");
        return messageMapper.selectOne(wrapper);
    }

    private void refreshSessionSummary(ReplyChatSession session) {
        List<ReplyChatMessage> messages = listMessages(session.getId());
        if (messages.size() <= MAX_CONTEXT_MESSAGES) {
            return;
        }
        List<ReplyChatMessage> olderMessages = messages.subList(0, messages.size() - MAX_CONTEXT_MESSAGES);
        StringBuilder summary = new StringBuilder("前情摘要：");
        for (ReplyChatMessage message : olderMessages) {
            String speaker = "opponent".equals(message.getRole()) ? "对方" : "我";
            summary.append(speaker).append("说：").append(message.getContent()).append("；");
            if (summary.length() >= MAX_SUMMARY_LENGTH) {
                break;
            }
        }
        String nextSummary = summary.length() > MAX_SUMMARY_LENGTH
                ? summary.substring(0, MAX_SUMMARY_LENGTH)
                : summary.toString();
        session.setSessionSummary(nextSummary);
    }

    private String trimAndLimit(String value, int maxLength, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new RuntimeException(fieldName + "最多 " + maxLength + " 字");
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private String defaultModel(String model) {
        return model == null || model.isBlank() ? AiModel.DEFAULT_MODEL : model;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private record SourceContext(String chatContent, String roleBackground, String userIntent,
                                 String modelUsed, String suggestionContent) {
    }
}
