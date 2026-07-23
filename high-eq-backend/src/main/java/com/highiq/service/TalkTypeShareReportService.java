package com.highiq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.highiq.dto.TalkTypeDeepReportResponse;
import com.highiq.dto.TalkTypeShareReportRequest;
import com.highiq.dto.TalkTypeShareReportResponse;
import com.highiq.entity.TalkTypeShareReport;
import com.highiq.mapper.TalkTypeShareReportMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;

@Service
public class TalkTypeShareReportService {
    private static final char[] SHARE_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();

    private final TalkTypeShareReportMapper mapper;
    private final ObjectMapper objectMapper;
    private final SecureRandom random = new SecureRandom();

    public TalkTypeShareReportService(TalkTypeShareReportMapper mapper, ObjectMapper objectMapper) {
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public TalkTypeShareReportResponse createShareReport(TalkTypeShareReportRequest request) {
        String shareId = nextShareId();
        TalkTypeShareReport report = TalkTypeShareReport.builder()
                .shareId(shareId)
                .personalityId(request.getPersonalityId())
                .personalityName(request.getPersonalityName())
                .codeName(request.getCodeName())
                .communicationCode(request.getCommunicationCode())
                .maturityScore(request.getMaturityScore())
                .dimensionScoresJson(toJson(request.getDimensionScores()))
                .tagline(request.getTagline())
                .summary(request.getSummary())
                .shareText(request.getShareText())
                .imagePath(request.getImagePath())
                .primaryColor(request.getPrimaryColor())
                .secondaryColor(request.getSecondaryColor())
                .tagsJson(toJson(request.getTags()))
                .identityInsight(request.getIdentityInsight())
                .strengthsJson(toJson(request.getStrengths()))
                .blindSpotsJson(toJson(request.getBlindSpots()))
                .trainingFocusJson(toJson(request.getTrainingFocus()))
                .relationshipBehavior(request.getRelationshipBehavior())
                .workplaceBehavior(request.getWorkplaceBehavior())
                .friendshipBehavior(request.getFriendshipBehavior())
                .snapshotReportJson(toJson(request.getSnapshotReport()))
                .deepReportJson(toJson(request.getDeepReport()))
                .build();
        mapper.insert(report);
        return toResponse(report);
    }

    public TalkTypeShareReportResponse getShareReport(String shareId) {
        TalkTypeShareReport report = mapper.selectByShareId(shareId);
        if (report == null) {
            throw new IllegalArgumentException("分享报告不存在");
        }
        return toResponse(report);
    }

    private TalkTypeShareReportResponse toResponse(TalkTypeShareReport report) {
        return TalkTypeShareReportResponse.builder()
                .shareId(report.getShareId())
                .shareUrl("/talktype/result/" + report.getShareId())
                .personalityId(report.getPersonalityId())
                .personalityName(report.getPersonalityName())
                .codeName(report.getCodeName())
                .communicationCode(report.getCommunicationCode())
                .maturityScore(report.getMaturityScore())
                .dimensionScores(fromJson(report.getDimensionScoresJson(), new TypeReference<Map<String, Integer>>() {}, Map.of()))
                .tagline(report.getTagline())
                .summary(report.getSummary())
                .shareText(report.getShareText())
                .imagePath(report.getImagePath())
                .primaryColor(report.getPrimaryColor())
                .secondaryColor(report.getSecondaryColor())
                .tags(fromJson(report.getTagsJson()))
                .identityInsight(report.getIdentityInsight())
                .strengths(fromJson(report.getStrengthsJson()))
                .blindSpots(fromJson(report.getBlindSpotsJson()))
                .trainingFocus(fromJson(report.getTrainingFocusJson()))
                .relationshipBehavior(report.getRelationshipBehavior())
                .workplaceBehavior(report.getWorkplaceBehavior())
                .friendshipBehavior(report.getFriendshipBehavior())
                .snapshotReport(fromJson(report.getSnapshotReportJson(), new TypeReference<Map<String, Object>>() {}, Map.of()))
                .deepReport(fromJson(report.getDeepReportJson(), new TypeReference<TalkTypeDeepReportResponse>() {}, null))
                .build();
    }

    private String nextShareId() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder value = new StringBuilder();
            for (int index = 0; index < 10; index++) {
                value.append(SHARE_ALPHABET[random.nextInt(SHARE_ALPHABET.length)]);
            }
            String shareId = value.toString();
            if (mapper.selectByShareId(shareId) == null) {
                return shareId;
            }
        }
        throw new IllegalStateException("分享链接生成失败，请稍后再试");
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value == null ? List.of() : value);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<String> fromJson(String value) {
        return fromJson(value, new TypeReference<List<String>>() {}, List.of());
    }

    private <T> T fromJson(String value, TypeReference<T> typeReference, T fallback) {
        try {
            if (value == null || value.isBlank()) {
                return fallback;
            }
            return objectMapper.readValue(value, typeReference);
        } catch (Exception e) {
            return fallback;
        }
    }
}
