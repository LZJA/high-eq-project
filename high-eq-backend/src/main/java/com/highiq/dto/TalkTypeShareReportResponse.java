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
public class TalkTypeShareReportResponse {
    private String shareId;
    private String shareUrl;
    private String personalityId;
    private String personalityName;
    private String codeName;
    private String communicationCode;
    private Integer maturityScore;
    private Map<String, Integer> dimensionScores;
    private String tagline;
    private String summary;
    private String shareText;
    private String imagePath;
    private String primaryColor;
    private String secondaryColor;
    private List<String> tags;
    private String identityInsight;
    private List<String> strengths;
    private List<String> blindSpots;
    private List<String> trainingFocus;
    private String relationshipBehavior;
    private String workplaceBehavior;
    private String friendshipBehavior;
    private Map<String, Object> snapshotReport;
    private TalkTypeDeepReportResponse deepReport;
}
