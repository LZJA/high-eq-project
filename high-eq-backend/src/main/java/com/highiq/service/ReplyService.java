package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import com.highiq.dto.HistoryDTO;
import com.highiq.entity.History;
import com.highiq.entity.ReplySuggestion;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.ReplySuggestionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    private final ReplySuggestionMapper replySuggestionMapper;
    
    public ReplyService(AiService aiService, ReplySuggestionMapper replySuggestionMapper) {
        this.aiService = aiService;
        this.replySuggestionMapper = replySuggestionMapper;
    }
    
    /**
     * 生成高情商回复
     */
    @Transactional
    public GenerateReplyResponse generateReplies(String userId, GenerateReplyRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // 调用 AI 服务生成回复
            List<String> suggestions = aiService.generateReplies(
                    request.getChatContent(),
                    request.getRoleBackground(),
                    request.getUserIntent(),
                    request.getReplyCount()
            );
            
            // 保存到数据库
            String historyId = UUID.randomUUID().toString();
            History history = History.builder()
                    .id(historyId)
                    .userId(userId)
                    .chatContent(request.getChatContent())
                    .roleBackground(request.getRoleBackground())
                    .userIntent(request.getUserIntent())
                    .modelUsed(request.getModelPreference() != null ? request.getModelPreference() : "deepseek-chat")
                    .status(1)
                    .isFavorite(0)
                    .build();
            
            baseMapper.insert(history);
            
            // 保存回复建议
            for (int i = 0; i < suggestions.size(); i++) {
                ReplySuggestion suggestion = ReplySuggestion.builder()
                        .id(UUID.randomUUID().toString())
                        .historyId(historyId)
                        .suggestionText(suggestions.get(i))
                        .orderIndex(i + 1)
                        .isSelected(0)
                        .build();
                replySuggestionMapper.insert(suggestion);
            }
            
            long endTime = System.currentTimeMillis();
            long generatedTime = endTime - startTime;
            
            log.info("Generated {} replies in {} ms", suggestions.size(), generatedTime);
            
            return GenerateReplyResponse.builder()
                    .historyId(historyId)
                    .suggestions(suggestions)
                    .modelUsed(request.getModelPreference() != null ? request.getModelPreference() : "deepseek-chat")
                    .generatedTime(generatedTime)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate replies", e);
            throw new RuntimeException("生成回复失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户的历史记录
     */
    public List<HistoryDTO> getUserHistory(String userId, Integer page, Integer size) {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;
        
        int offset = (page - 1) * size;
        
        QueryWrapper<History> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                .eq("status", 1)
                .orderByDesc("create_time")
                .last("LIMIT " + offset + ", " + size);
        
        List<History> histories = baseMapper.selectList(queryWrapper);
        
        return histories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 获取单个历史记录详情
     */
    public HistoryDTO getHistoryDetail(String historyId, String userId) {
        History history = baseMapper.selectById(historyId);
        
        if (history == null || !history.getUserId().equals(userId)) {
            throw new RuntimeException("历史记录不存在");
        }
        
        return convertToDTO(history);
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
     * 获取用户收藏的历史记录
     */
    public List<HistoryDTO> getFavoriteHistory(String userId) {
        QueryWrapper<History> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                .eq("status", 1)
                .eq("is_favorite", 1)
                .orderByDesc("create_time");
        
        List<History> histories = baseMapper.selectList(queryWrapper);
        
        return histories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
                .map(ReplySuggestion::getSuggestionText)
                .collect(Collectors.toList());
    }
    
    /**
     * 将 History 转换为 HistoryDTO
     */
    private HistoryDTO convertToDTO(History history) {
        return HistoryDTO.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .chatContent(history.getChatContent())
                .roleBackground(history.getRoleBackground())
                .userIntent(history.getUserIntent())
                .modelUsed(history.getModelUsed())
                .isFavorite(history.getIsFavorite())
                .createTime(history.getCreateTime())
                .build();
    }
}
