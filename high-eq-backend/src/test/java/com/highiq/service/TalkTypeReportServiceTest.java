package com.highiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.highiq.dto.TalkTypeDeepReportRequest;
import com.highiq.dto.TalkTypeDeepReportResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TalkTypeReportServiceTest {
    private AiService aiService;
    private TalkTypeReportService service;

    @BeforeEach
    void setUp() {
        aiService = mock(AiService.class);
        service = new TalkTypeReportService(aiService, new ObjectMapper());
    }

    @Test
    void generatesStructuredDeepReportWithBasicModel() {
        TalkTypeDeepReportRequest request = sampleRequest();
        when(aiService.generateText(contains("关系经营者"), eq("deepseek-v4-flash"))).thenReturn("""
                {
                  "hiddenPattern": "你很在意关系里的回应是否对等，会主动修复，也会在长期没有回声时感到疲惫。",
                  "innerNeed": "你真正需要的是稳定、清楚、愿意互相照顾的连接。",
                  "triggerPhrases": ["你想太多了", "随便你吧", "我最近太忙了"],
                  "misreadByOthers": "别人可能以为你只是好说话，其实你是在认真经营关系。",
                  "relationshipNotes": {
                    "relationship": "亲密关系里，你会记得细节，也期待对方给出回应。",
                    "workplace": "职场里，你适合维护合作关系和沟通节奏。",
                    "friendship": "朋友会觉得你细心，但你也要避免单方面用力。"
                  },
                  "growthSuggestion": "修复关系前，先确认这次是不是又由你承担了双人份努力。",
                  "practicePrompts": ["表达期待", "确认边界", "减少过度承担"]
                }
                """);

        TalkTypeDeepReportResponse report = service.generateDeepReport(request);

        assertThat(report.getHiddenPattern()).contains("回应是否对等");
        assertThat(report.getTriggerPhrases()).containsExactly("你想太多了", "随便你吧", "我最近太忙了");
        assertThat(report.getRelationshipNotes()).containsEntry("workplace", "职场里，你适合维护合作关系和沟通节奏。");
        assertThat(report.getModelUsed()).isEqualTo("deepseek-v4-flash");
        assertThat(report.getFallback()).isFalse();
    }

    @Test
    void fallsBackWhenAiReturnsInvalidJson() {
        TalkTypeDeepReportRequest request = sampleRequest();
        when(aiService.generateText(contains("关系经营者"), eq("deepseek-v4-flash"))).thenReturn("这不是 JSON");

        TalkTypeDeepReportResponse report = service.generateDeepReport(request);

        assertThat(report.getHiddenPattern()).contains("关系经营者");
        assertThat(report.getTriggerPhrases()).hasSize(3);
        assertThat(report.getRelationshipNotes()).containsKeys("relationship", "workplace", "friendship");
        assertThat(report.getFallback()).isTrue();
    }

    private TalkTypeDeepReportRequest sampleRequest() {
        return TalkTypeDeepReportRequest.builder()
                .personalityName("关系经营者")
                .codeName("Relationship Curator")
                .communicationCode("S84 W73 B78 C74")
                .maturityScore(77)
                .dimensionScores(Map.of("S", 84, "W", 73, "B", 78, "C", 74))
                .strengths(List.of("长期主义", "回应稳定", "懂得维护关系质量"))
                .blindSpots(List.of("容易承担维护关系的主要责任", "有时会疲惫", "对低回应的人容忍过久"))
                .trainingFocus(List.of("避免单方面经营", "表达自己的期待", "识别不对等关系"))
                .relationshipBehavior("你会记得重要细节，也愿意主动修复关系里的小误会。")
                .workplaceBehavior("在职场里，你擅长维护合作关系和沟通节奏，让事情更容易持续推进。")
                .friendshipBehavior("朋友会觉得你靠谱、细心，和你相处有被放在心上的感觉。")
                .build();
    }
}
