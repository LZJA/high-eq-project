package com.highiq.dto;

import lombok.Data;

import java.util.List;

@Data
public class GenerateChatSuggestionsRequest {
    private String opponentMessage;
    private String chatImage;

    private String userIntent;
    private String modelPreference;
    private List<String> excludeSuggestionIds;
}
