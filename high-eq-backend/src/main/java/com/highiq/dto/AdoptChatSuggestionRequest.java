package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdoptChatSuggestionRequest {
    @NotBlank(message = "回复建议不能为空")
    private String suggestionId;

    @NotBlank(message = "发送内容不能为空")
    private String finalContent;
}
