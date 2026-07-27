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
public class ReplyChatSessionDTO {
    private String id;
    private String historyId;
    private String sourceSuggestionId;
    private String roleBackground;
    private String initialChatContent;
    private String initialUserIntent;
    private String modelPreference;
    private Integer turnCount;
    private Integer maxTurnCount;
    private Integer warnTurnCount;
    private String status;
    private List<ReplyChatMessageDTO> messages;
    private List<ReplyChatSuggestionDTO> latestSuggestions;
}
