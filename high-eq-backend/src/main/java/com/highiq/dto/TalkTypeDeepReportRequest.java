package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
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
public class TalkTypeDeepReportRequest {
    @NotBlank
    private String personalityName;

    private String codeName;
    private String communicationCode;
    private Integer maturityScore;
    private Map<String, Integer> dimensionScores;
    private List<String> strengths;
    private List<String> blindSpots;
    private List<String> trainingFocus;
    private String relationshipBehavior;
    private String workplaceBehavior;
    private String friendshipBehavior;
}
