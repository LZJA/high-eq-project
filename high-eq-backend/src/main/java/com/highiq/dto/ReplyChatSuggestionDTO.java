package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyChatSuggestionDTO {
    private String id;
    private String content;
    private String reason;
    private String styleLabel;
    private Integer isAdopted;
}
