package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class GenerateChatSuggestionsRequest {
    @NotBlank(message = "对方消息不能为空")
    private String opponentMessage;

    private String userIntent;
    private String modelPreference;
    private List<String> excludeSuggestionIds;
}
