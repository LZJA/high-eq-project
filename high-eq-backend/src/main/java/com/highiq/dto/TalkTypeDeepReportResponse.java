package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TalkTypeDeepReportResponse {
    private String hiddenPattern;
    private String innerNeed;
    private List<String> triggerPhrases;
    private String misreadByOthers;
    private Map<String, String> relationshipNotes;
    private String growthSuggestion;
    private List<String> practicePrompts;
    private String modelUsed;
    private Boolean fallback;
}
