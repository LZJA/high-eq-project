package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import com.highiq.dto.HistoryDTO;
import com.highiq.dto.PageResponse;
import com.highiq.dto.RegenerateReplyRequest;
import com.highiq.dto.SuggestionDTO;
import com.highiq.entity.History;
import com.highiq.entity.ProfileChatHistory;
import com.highiq.entity.ProfileReplySuggestion;
import com.highiq.entity.ReplySuggestion;
import com.highiq.enums.AiModel;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.ProfileChatHistoryMapper;
import com.highiq.mapper.ProfileReplySuggestionMapper;
import com.highiq.mapper.ReplySuggestionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 回复服务类
 */
@Slf4j
@Service
public class ReplyService extends ServiceImpl<HistoryMapper, History> {

    private final AiService aiService;
    private final QwenVisionService qwenVisionService;
    private final DoubaoVisionService doubaoVisionService;
    private final ReplySuggestionMapper replySuggestionMapper;
    private final ProfileChatHistoryMapper profileChatHistoryMapper;
    private final ProfileReplySuggestionMapper profileReplySuggestionMapper;
    private final QuotaService quotaService;
    private final PersonProfileService personProfileService;
    private final StatisticsService statisticsService;

    public ReplyService(AiService aiService, QwenVisionService qwenVisionService, DoubaoVisionService doubaoVisionService,
                       ReplySuggestionMapper replySuggestionMapper,
                       ProfileChatHistoryMapper profileChatHistoryMapper,
                       ProfileReplySuggestionMapper profileReplySuggestionMapper,
                       QuotaService quotaService,
                       PersonProfileService personProfileService,
                       StatisticsService statisticsService) {
        this.aiService = aiService;
        this.qwenVisionService = qwenVisionService;
        this.doubaoVisionService = doubaoVisionService;
        this.replySuggestionMapper = replySuggestionMapper;
        this.profileChatHistoryMapper = profileChatHistoryMapper;
        this.profileReplySuggestionMapper = profileReplySuggestionMapper;
        this.quotaService = quotaService;
        this.personProfileService = personProfileService;
        this.statisticsService = statisticsService;
    }
    
    /**
     * 生成高情商回复
     */
    @Transactional
    public GenerateReplyResponse generateReplies(String userId, GenerateReplyRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            // === 模型检查 ===
            String requestedModel = request.getModelPreference() != null ?
                    request.getModelPreference() : AiModel.DEFAULT_MODEL;
            if (!quotaService.isModelAvailable(userId, requestedModel)) {
                throw new RuntimeException("当前订阅级别不支持使用 " + requestedModel + " 模型，请升级到 PRO 版本");
            }

            // === 点数检查 ===
            if (!quotaService.checkAndConsumeQuota(userId, requestedModel)) {
                throw new RuntimeException("今日点数不足，请切换低消耗模型或升级会员");
            }

            // 调用 AI 服务生成回复。新版本固定生成 5 条，由 AI 自适应风格标签。
            List<String> aiSuggestions;
            if (AiModel.QWEN3_VL_PLUS.getId().equals(requestedModel)) {
                aiSuggestions = qwenVisionService.generateRepliesWithImage(
                        request.getChatImage(),
                        request.getChatContent(),
                        request.getRoleBackground(),
                        request.getUserIntent(),
                        AiService.DEFAULT_REPLY_COUNT
                );
            } else if (AiModel.DOUBAO_SEED_2_PRO.getId().equals(requestedModel)) {
                aiSuggestions = doubaoVisionService.generateRepliesWithImage(
                        request.getChatImage(),
                        request.getChatContent(),
                        request.getRoleBackground(),
                        request.getUserIntent(),
                        AiService.DEFAULT_REPLY_COUNT
                );
            } else {
                aiSuggestions = aiService.generateReplies(
                        request.getChatContent(),
                        request.getRoleBackground(),
                        request.getUserIntent(),
                        AiService.DEFAULT_REPLY_COUNT,
                        requestedModel
                );
            }

            // 保存到数据库
            String historyId = UUID.randomUUID().toString();
            String modelUsed = request.getModelPreference() != null ? request.getModelPreference() : AiModel.DEFAULT_MODEL;

            // 判断是否为人物档案聊天
            if (request.getPersonProfileId() != null && !request.getPersonProfileId().isEmpty()) {
                // 保存到人物档案聊天记录表
                ProfileChatHistory profileHistory = ProfileChatHistory.builder()
                        .id(historyId)
                        .personProfileId(request.getPersonProfileId())
                        .userId(userId)
                        .chatContent(request.getChatContent())
                        .roleBackground(request.getRoleBackground())
                        .userIntent(request.getUserIntent())
                        .modelUsed(modelUsed)
                        .chatImage(request.getChatImage())
                        .status(1)
                        .isFavorite(0)
                        .build();
                profileChatHistoryMapper.insert(profileHistory);
            } else {
                // 保存到全局历史记录表
                History history = History.builder()
                        .id(historyId)
                        .userId(userId)
                        .chatContent(request.getChatContent())
                        .roleBackground(request.getRoleBackground())
                        .userIntent(request.getUserIntent())
                        .modelUsed(modelUsed)
                        .chatImage(request.getChatImage())
                        .status(1)
                        .isFavorite(0)
                        .build();
                baseMapper.insert(history);
            }

            // 构建返回的建议列表
            List<SuggestionDTO> suggestionDTOs = new ArrayList<>();

            // 保存回复建议到对应的表
            for (int i = 0; i < Math.min(aiSuggestions.size(), AiService.DEFAULT_REPLY_COUNT); i++) {
                String suggestionId = UUID.randomUUID().toString();
                String aiSuggestion = aiSuggestions.get(i);

                ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(aiSuggestion);

                if (request.getPersonProfileId() != null && !request.getPersonProfileId().isEmpty()) {
                    ProfileReplySuggestion suggestion = ProfileReplySuggestion.builder()
                            .id(suggestionId)
                            .historyId(historyId)
                            .suggestionText(aiSuggestion)
                            .styleLabel(parsed.styleLabel())
                            .orderIndex(i + 1)
                            .isSelected(0)
                            .build();
                    profileReplySuggestionMapper.insert(suggestion);
                } else {
                    ReplySuggestion suggestion = ReplySuggestion.builder()
                            .id(suggestionId)
                            .historyId(historyId)
                            .suggestionText(aiSuggestion)
                            .styleLabel(parsed.styleLabel())
                            .orderIndex(i + 1)
                            .isSelected(0)
                            .build();
                    replySuggestionMapper.insert(suggestion);
                }

                SuggestionDTO dto = SuggestionDTO.builder()
                        .id(suggestionId)
                        .content(parsed.content())
                        .reason(parsed.reason())
                        .styleLabel(parsed.styleLabel())
                        .build();
                suggestionDTOs.add(dto);
            }

            long endTime = System.currentTimeMillis();
            long generatedTime = endTime - startTime;

            log.info("Generated {} replies in {} ms", aiSuggestions.size(), generatedTime);

            if (request.getPersonProfileId() != null && !request.getPersonProfileId().isEmpty()) {
                statisticsService.recordProfileReply(userId);
            } else {
                statisticsService.recordUserReply(userId);
            }

            return GenerateReplyResponse.builder()
                    .historyId(historyId)
                    .suggestions(suggestionDTOs)
                    .modelUsed(request.getModelPreference() != null ? request.getModelPreference() : AiModel.DEFAULT_MODEL)
                    .generatedTime(generatedTime)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate replies", e);
            throw new RuntimeException("生成回复失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户的历史记录（分页）
     */
    public PageResponse<HistoryDTO> getUserHistory(String userId, Integer page, Integer size) {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;

        int offset = (page - 1) * size;

        QueryWrapper<History> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                .eq("status", 1)
                .isNull("person_profile_id")
                .orderByDesc("create_time");

        // 获取总数
        Long total = baseMapper.selectCount(queryWrapper);

        // 获取当前页数据
        queryWrapper.last("LIMIT " + offset + ", " + size);
        List<History> histories = baseMapper.selectList(queryWrapper);

        List<HistoryDTO> items = histories.stream()
                .map(h -> convertToDTO(h, false))
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) total / size);

        return PageResponse.<HistoryDTO>builder()
                .items(items)
                .totalPages(totalPages)
                .total(total)
                .currentPage(page)
                .pageSize(size)
                .build();
    }
    
    /**
     * 获取单个历史记录详情（包含建议列表）
     */
    public HistoryDTO getHistoryDetail(String historyId, String userId) {
        History history = baseMapper.selectById(historyId);

        if (history == null || !history.getUserId().equals(userId)) {
            throw new RuntimeException("历史记录不存在");
        }

        return convertToDTO(history, true);
    }
    
    /**
     * 删除历史记录
     */
    @Transactional
    public void deleteHistory(String historyId, String userId) {
        History history = baseMapper.selectById(historyId);
        
        if (history == null || !history.getUserId().equals(userId)) {
            throw new RuntimeException("历史记录不存在");
        }

        QueryWrapper<ReplySuggestion> suggestionWrapper = new QueryWrapper<>();
        suggestionWrapper.eq("history_id", historyId);
        replySuggestionMapper.delete(suggestionWrapper);
        
        // 软删除
        history.setStatus(0);
        baseMapper.updateById(history);
        
        log.info("History deleted: {}", historyId);
    }
    
    /**
     * 收藏/取消收藏历史记录
     */
    @Transactional
    public void toggleFavorite(String historyId, String userId) {
        History history = baseMapper.selectById(historyId);
        
        if (history == null || !history.getUserId().equals(userId)) {
            throw new RuntimeException("历史记录不存在");
        }
        
        history.setIsFavorite(history.getIsFavorite() == 0 ? 1 : 0);
        baseMapper.updateById(history);
    }
    
    /**
     * 获取用户收藏的历史记录（包含建议列表）
     */
    public List<HistoryDTO> getFavoriteHistory(String userId) {
        QueryWrapper<History> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                .eq("status", 1)
                .eq("is_favorite", 1)
                .isNull("person_profile_id")
                .orderByDesc("create_time");

        List<History> histories = baseMapper.selectList(queryWrapper);

        List<HistoryDTO> favoriteHistories = histories.stream()
                .map(h -> convertToDTO(h, true))
                .collect(Collectors.toList());

        favoriteHistories.addAll(personProfileService.getFavoriteProfileHistory(userId));
        favoriteHistories.sort(Comparator.comparing(HistoryDTO::getCreateTime, Comparator.nullsLast(String::compareTo)).reversed());
        return favoriteHistories;
    }
    
    /**
     * 获取历史记录的回复建议
     */
    public List<String> getHistorySuggestions(String historyId, String userId) {
        // 验证历史记录属于该用户
        History history = baseMapper.selectById(historyId);
        if (history == null || !history.getUserId().equals(userId)) {
            throw new RuntimeException("历史记录不存在");
        }

        QueryWrapper<ReplySuggestion> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("history_id", historyId)
                .orderByAsc("order_index");

        List<ReplySuggestion> suggestions = replySuggestionMapper.selectList(queryWrapper);

        return suggestions.stream()
                .map(rs -> ReplyStyleLabelParser.parse(rs.getSuggestionText()).content())
                .collect(Collectors.toList());
    }

    /**
     * 换一批回复建议，保留同一条历史记录并追加新的 5 条候选。
     */
    @Transactional
    public GenerateReplyResponse regenerateReplies(String userId, String historyId, RegenerateReplyRequest request) {
        long startTime = System.currentTimeMillis();

        History history = baseMapper.selectById(historyId);
        ProfileChatHistory profileHistory = null;
        if (history == null || !history.getUserId().equals(userId) || (history.getStatus() != null && history.getStatus() == 0)) {
            profileHistory = profileChatHistoryMapper.selectById(historyId);
        }
        boolean isProfileHistory = profileHistory != null
                && profileHistory.getUserId().equals(userId)
                && (profileHistory.getStatus() == null || profileHistory.getStatus() == 1);
        if ((history == null || !history.getUserId().equals(userId) || (history.getStatus() != null && history.getStatus() == 0))
                && !isProfileHistory) {
            throw new RuntimeException("历史记录不存在");
        }

        String requestedModel = request != null && request.getModelPreference() != null
                ? request.getModelPreference()
                : (isProfileHistory && profileHistory.getModelUsed() != null
                    ? profileHistory.getModelUsed()
                    : (history != null && history.getModelUsed() != null ? history.getModelUsed() : AiModel.DEFAULT_MODEL));
        if (!quotaService.isModelAvailable(userId, requestedModel)) {
            throw new RuntimeException("当前订阅级别不支持使用 " + requestedModel + " 模型，请升级到 PRO 版本");
        }
        if (!quotaService.checkAndConsumeQuota(userId, requestedModel)) {
            throw new RuntimeException("今日点数不足，请切换低消耗模型或升级会员");
        }

        List<String> excludeContents = new ArrayList<>();
        if (request != null && request.getExcludeContents() != null) {
            excludeContents.addAll(request.getExcludeContents());
        }

        int nextOrderIndex;
        if (isProfileHistory) {
            QueryWrapper<ProfileReplySuggestion> existingWrapper = new QueryWrapper<>();
            existingWrapper.eq("history_id", historyId).orderByAsc("order_index");
            List<ProfileReplySuggestion> existingSuggestions = profileReplySuggestionMapper.selectList(existingWrapper);
            for (ProfileReplySuggestion suggestion : existingSuggestions) {
                if (request == null
                        || request.getExcludeSuggestionIds() == null
                        || request.getExcludeSuggestionIds().isEmpty()
                        || request.getExcludeSuggestionIds().contains(suggestion.getId())) {
                    excludeContents.add(ReplyStyleLabelParser.parse(suggestion.getSuggestionText()).content());
                }
            }
            nextOrderIndex = existingSuggestions.stream()
                    .map(ProfileReplySuggestion::getOrderIndex)
                    .filter(index -> index != null)
                    .max(Integer::compareTo)
                    .orElse(0) + 1;
        } else {
            QueryWrapper<ReplySuggestion> existingWrapper = new QueryWrapper<>();
            existingWrapper.eq("history_id", historyId).orderByAsc("order_index");
            List<ReplySuggestion> existingSuggestions = replySuggestionMapper.selectList(existingWrapper);
            for (ReplySuggestion suggestion : existingSuggestions) {
                if (request == null
                        || request.getExcludeSuggestionIds() == null
                        || request.getExcludeSuggestionIds().isEmpty()
                        || request.getExcludeSuggestionIds().contains(suggestion.getId())) {
                    excludeContents.add(ReplyStyleLabelParser.parse(suggestion.getSuggestionText()).content());
                }
            }
            nextOrderIndex = existingSuggestions.stream()
                    .map(ReplySuggestion::getOrderIndex)
                    .filter(index -> index != null)
                    .max(Integer::compareTo)
                    .orElse(0) + 1;
        }

        List<String> aiSuggestions = aiService.generateRegeneratedReplies(
                isProfileHistory ? profileHistory.getChatContent() : history.getChatContent(),
                isProfileHistory ? profileHistory.getRoleBackground() : history.getRoleBackground(),
                isProfileHistory ? profileHistory.getUserIntent() : history.getUserIntent(),
                requestedModel,
                excludeContents
        );

        List<SuggestionDTO> suggestionDTOs = isProfileHistory
                ? saveProfileReplySuggestions(historyId, aiSuggestions, nextOrderIndex)
                : saveReplySuggestions(historyId, aiSuggestions, nextOrderIndex);

        long generatedTime = System.currentTimeMillis() - startTime;
        log.info("Regenerated {} replies for history {} in {} ms", suggestionDTOs.size(), historyId, generatedTime);

        return GenerateReplyResponse.builder()
                .historyId(historyId)
                .suggestions(suggestionDTOs)
                .modelUsed(requestedModel)
                .generatedTime(generatedTime)
                .build();
    }
    
    /**
     * 将 History 转换为 HistoryDTO
     * @param history 历史记录实体
     * @param includeSuggestions 是否包含建议列表
     */
    private HistoryDTO convertToDTO(History history, boolean includeSuggestions) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        List<SuggestionDTO> suggestions = null;
        if (includeSuggestions) {
            suggestions = getSuggestionsForHistory(history.getId());
        }

        return HistoryDTO.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .personProfileId(null)
                .chatContent(history.getChatContent())
                .roleBackground(history.getRoleBackground())
                .userIntent(history.getUserIntent())
                .modelUsed(history.getModelUsed())
                .chatImage(history.getChatImage())
                .isFavorite(history.getIsFavorite() != null && history.getIsFavorite() == 1)
                .createTime(history.getCreateTime() != null ? history.getCreateTime().format(formatter) : null)
                .suggestions(suggestions)
                .build();
    }

    /**
     * 获取历史记录的建议列表
     */
    private List<SuggestionDTO> getSuggestionsForHistory(String historyId) {
        QueryWrapper<ReplySuggestion> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("history_id", historyId)
                .orderByAsc("order_index");

        List<ReplySuggestion> replySuggestions = replySuggestionMapper.selectList(queryWrapper);

        return replySuggestions.stream()
                .map(this::toSuggestionDTO)
                .collect(Collectors.toList());
    }

    /**
     * 游客生成回复（不保存数据库）
     */
    public GenerateReplyResponse generateRepliesForGuest(GenerateReplyRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            List<String> aiSuggestions = aiService.generateReplies(
                    request.getChatContent(),
                    request.getRoleBackground(),
                    request.getUserIntent(),
                    AiService.DEFAULT_REPLY_COUNT
            );

            List<SuggestionDTO> suggestionDTOs = new ArrayList<>();

            for (String aiSuggestion : aiSuggestions.stream().limit(AiService.DEFAULT_REPLY_COUNT).toList()) {
                ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(aiSuggestion);

                SuggestionDTO dto = SuggestionDTO.builder()
                        .id(UUID.randomUUID().toString())
                        .content(parsed.content())
                        .reason(parsed.reason())
                        .styleLabel(parsed.styleLabel())
                        .build();
                suggestionDTOs.add(dto);
            }

            long endTime = System.currentTimeMillis();
            return GenerateReplyResponse.builder()
                    .historyId(null)
                    .suggestions(suggestionDTOs)
                    .modelUsed(AiModel.DEFAULT_MODEL)
                    .generatedTime(endTime - startTime)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate replies for guest", e);
            throw new RuntimeException("生成回复失败: " + e.getMessage());
        }
    }

    private List<SuggestionDTO> saveReplySuggestions(String historyId, List<String> aiSuggestions, int startOrderIndex) {
        List<SuggestionDTO> suggestionDTOs = new ArrayList<>();
        for (int i = 0; i < Math.min(aiSuggestions.size(), AiService.DEFAULT_REPLY_COUNT); i++) {
            String suggestionId = UUID.randomUUID().toString();
            String aiSuggestion = aiSuggestions.get(i);
            ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(aiSuggestion);

            ReplySuggestion suggestion = ReplySuggestion.builder()
                    .id(suggestionId)
                    .historyId(historyId)
                    .suggestionText(aiSuggestion)
                    .styleLabel(parsed.styleLabel())
                    .orderIndex(startOrderIndex + i)
                    .isSelected(0)
                    .build();
            replySuggestionMapper.insert(suggestion);

            suggestionDTOs.add(toSuggestionDTO(suggestion));
        }
        return suggestionDTOs;
    }

    private List<SuggestionDTO> saveProfileReplySuggestions(String historyId, List<String> aiSuggestions, int startOrderIndex) {
        List<SuggestionDTO> suggestionDTOs = new ArrayList<>();
        for (int i = 0; i < Math.min(aiSuggestions.size(), AiService.DEFAULT_REPLY_COUNT); i++) {
            String suggestionId = UUID.randomUUID().toString();
            String aiSuggestion = aiSuggestions.get(i);
            ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(aiSuggestion);

            ProfileReplySuggestion suggestion = ProfileReplySuggestion.builder()
                    .id(suggestionId)
                    .historyId(historyId)
                    .suggestionText(aiSuggestion)
                    .styleLabel(parsed.styleLabel())
                    .orderIndex(startOrderIndex + i)
                    .isSelected(0)
                    .build();
            profileReplySuggestionMapper.insert(suggestion);

            suggestionDTOs.add(SuggestionDTO.builder()
                    .id(suggestion.getId())
                    .content(parsed.content())
                    .reason(parsed.reason())
                    .styleLabel(parsed.styleLabel())
                    .build());
        }
        return suggestionDTOs;
    }

    private SuggestionDTO toSuggestionDTO(ReplySuggestion suggestion) {
        ReplyStyleLabelParser.ParsedSuggestion parsed = ReplyStyleLabelParser.parse(suggestion.getSuggestionText());
        String styleLabel = suggestion.getStyleLabel() != null && !suggestion.getStyleLabel().isBlank()
                ? suggestion.getStyleLabel()
                : parsed.styleLabel();
        return SuggestionDTO.builder()
                .id(suggestion.getId())
                .content(parsed.content())
                .reason(parsed.reason())
                .styleLabel(styleLabel)
                .build();
    }
}
