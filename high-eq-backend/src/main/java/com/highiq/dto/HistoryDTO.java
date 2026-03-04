package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 历史记录 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDTO {

    private String id;

    private String userId;

    private String chatContent;

    private String roleBackground;

    private String userIntent;

    private String modelUsed;

    private String tone;  // 语气/风格

    private Boolean isFavorite;

    private String createTime;  // 格式化后的时间字符串

    private List<SuggestionDTO> suggestions;  // 历史详情时包含建议列表
}
