package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 回复建议 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionDTO {

    private String id;
    private String content;
    private String reason;
    private String tone;
}
