package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import com.highiq.dto.HistoryDTO;
import com.highiq.dto.PageResponse;
import com.highiq.dto.SuggestionDTO;
import com.highiq.entity.History;
import com.highiq.entity.ProfileChatHistory;
import com.highiq.entity.ProfileReplySuggestion;
import com.highiq.entity.ReplySuggestion;
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

    public ReplyService(AiService aiService, QwenVisionService qwenVisionService, DoubaoVisionService doubaoVisionService,
                       ReplySuggestionMapper replySuggestionMapper,
                       ProfileChatHistoryMapper profileChatHistoryMapper,
                       ProfileReplySuggestionMapper profileReplySuggestionMapper,
                       QuotaService quotaService,
                       PersonProfileService personProfileService) {
        this.aiService = aiService;
        this.qwenVisionService = qwenVisionService;
        this.doubaoVisionService = doubaoVisionService;
        this.replySuggestionMapper = replySuggestionMapper;
        this.profileChatHistoryMapper = profileChatHistoryMapper;
        this.profileReplySuggestionMapper = profileReplySuggestionMapper;
        this.quotaService = quotaService;
        this.personProfileService = personProfileService;
    }
    
    /**
     * 生成高情商回复
     */
    @Transactional
    public GenerateReplyResponse generateReplies(String userId, GenerateReplyRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            // === 配额检查 ===
            if (!quotaService.checkAndConsumeQuota(userId)) {
                throw new RuntimeException("今日配额已用尽，请升级到 PRO 版本获取无限次数");
            }

            // === 模型检查 ===
            String requestedModel = request.getModelPreference() != null ?
                    request.getModelPreference() : "deepseek-chat";
            if (!quotaService.isModelAvailable(userId, requestedModel)) {
                throw new RuntimeException("当前订阅级别不支持使用 " + requestedModel + " 模型，请升级到 PRO 版本");
            }

            // 调用 AI 服务生成回复
            List<String> aiSuggestions;
            if ("qwen-vl-plus".equals(requestedModel)) {
                aiSuggestions = qwenVisionService.generateRepliesWithImage(
                        request.getChatImage(),
                        request.getChatContent(),
                        request.getRoleBackground(),
                        request.getUserIntent(),
                        request.getReplyCount(),
                        request.getTone()
                );
            } else if ("doubao-seed-1-8-251228".equals(requestedModel)) {
                aiSuggestions = doubaoVisionService.generateRepliesWithImage(
                        request.getChatImage(),
                        request.getChatContent(),
                        request.getRoleBackground(),
                        request.getUserIntent(),
                        request.getReplyCount(),
                        request.getTone()
                );
            } else {
                aiSuggestions = aiService.generateReplies(
                        request.getChatContent(),
                        request.getRoleBackground(),
                        request.getUserIntent(),
                        request.getReplyCount(),
                        request.getTone()
                );
            }

            // 保存到数据库
            String historyId = UUID.randomUUID().toString();
            String selectedTone = request.getTone() != null && !request.getTone().isEmpty() ? request.getTone() : "自然得体";
            String modelUsed = request.getModelPreference() != null ? request.getModelPreference() : "deepseek-chat";

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
                        .tone(selectedTone)
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
                        .tone(selectedTone)
                        .chatImage(request.getChatImage())
                        .status(1)
                        .isFavorite(0)
                        .build();
                baseMapper.insert(history);
            }

            // 构建返回的建议列表
            List<SuggestionDTO> suggestionDTOs = new ArrayList<>();

            // 保存回复建议到对应的表
            for (int i = 0; i < aiSuggestions.size(); i++) {
                String suggestionId = UUID.randomUUID().toString();
                String aiSuggestion = aiSuggestions.get(i);

                String[] parts = aiSuggestion.split("\\|\\|\\|REASON\\|\\|\\|", 2);
                String content = parts[0];
                String reason = parts.length > 1 ? parts[1] : "这是一条高情商回复，能得体地表达意图";

                if (request.getPersonProfileId() != null && !request.getPersonProfileId().isEmpty()) {
                    ProfileReplySuggestion suggestion = ProfileReplySuggestion.builder()
                            .id(suggestionId)
                            .historyId(historyId)
                            .suggestionText(aiSuggestion)
                            .orderIndex(i + 1)
                            .isSelected(0)
                            .build();
                    profileReplySuggestionMapper.insert(suggestion);
                } else {
                    ReplySuggestion suggestion = ReplySuggestion.builder()
                            .id(suggestionId)
                            .historyId(historyId)
                            .suggestionText(aiSuggestion)
                            .orderIndex(i + 1)
                            .isSelected(0)
                            .build();
                    replySuggestionMapper.insert(suggestion);
                }

                SuggestionDTO dto = SuggestionDTO.builder()
                        .id(suggestionId)
                        .content(content)
                        .reason(reason)
                        .tone(selectedTone)
                        .build();
                suggestionDTOs.add(dto);
            }

            long endTime = System.currentTimeMillis();
            long generatedTime = endTime - startTime;

            log.info("Generated {} replies in {} ms", aiSuggestions.size(), generatedTime);

            return GenerateReplyResponse.builder()
                    .historyId(historyId)
                    .suggestions(suggestionDTOs)
                    .modelUsed(request.getModelPreference() != null ? request.getModelPreference() : "deepseek-chat")
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
                .map(rs -> {
                    String storedText = rs.getSuggestionText();
                    // 如果包含新格式分隔符，只返回内容部分
                    if (storedText.contains("|||REASON|||")) {
                        return storedText.split("\\|\\|\\|REASON\\|\\|\\|", 2)[0];
                    }
                    return storedText;
                })
                .collect(Collectors.toList());
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
            suggestions = getSuggestionsForHistory(history.getId(), history.getTone());
        }

        return HistoryDTO.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .personProfileId(null)
                .chatContent(history.getChatContent())
                .roleBackground(history.getRoleBackground())
                .userIntent(history.getUserIntent())
                .modelUsed(history.getModelUsed())
                .tone(history.getTone())
                .chatImage(history.getChatImage())
                .isFavorite(history.getIsFavorite() != null && history.getIsFavorite() == 1)
                .createTime(history.getCreateTime() != null ? history.getCreateTime().format(formatter) : null)
                .suggestions(suggestions)
                .build();
    }

    /**
     * 获取历史记录的建议列表
     */
    private List<SuggestionDTO> getSuggestionsForHistory(String historyId, String tone) {
        QueryWrapper<ReplySuggestion> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("history_id", historyId)
                .orderByAsc("order_index");

        List<ReplySuggestion> replySuggestions = replySuggestionMapper.selectList(queryWrapper);

        String displayTone = tone != null && !tone.isEmpty() ? tone : "自然得体";

        return replySuggestions.stream()
                .map(rs -> {
                    String storedText = rs.getSuggestionText();

                    // 尝试解析新格式：内容|||REASON|||理由
                    String content;
                    String reason;
                    if (storedText.contains("|||REASON|||")) {
                        String[] parts = storedText.split("\\|\\|\\|REASON\\|\\|\\|", 2);
                        content = parts[0];
                        reason = parts.length > 1 ? parts[1] : "这是一条高情商回复，能得体地表达意图";
                    } else {
                        // 旧格式，直接使用存储的文本作为内容
                        content = storedText;
                        reason = "使用" + displayTone + "语气生成的高情商回复";
                    }

                    return SuggestionDTO.builder()
                            .id(rs.getId())
                            .content(content)
                            .reason(reason)
                            .tone(displayTone)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
