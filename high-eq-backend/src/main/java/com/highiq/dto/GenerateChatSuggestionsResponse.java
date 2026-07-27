package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateChatSuggestionsResponse {
    private String sessionId;
    private Integer turnCount;
    private Integer maxTurnCount;
    private Integer warnTurnCount;
    private String opponentMessageId;
    private List<ReplyChatSuggestionDTO> suggestions;
}
