package com.highiq.dto;

import lombok.Data;

import java.util.List;

@Data
public class RegenerateReplyRequest {
    private String modelPreference;
    private List<String> excludeSuggestionIds;
    private List<String> excludeContents;
}
