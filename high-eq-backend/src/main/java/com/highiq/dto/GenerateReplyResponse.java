package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * AI 回复生成响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateReplyResponse {

    private String historyId;

    private List<SuggestionDTO> suggestions;

    private String modelUsed;

    private Long generatedTime;  // 生成耗时（毫秒）
}
