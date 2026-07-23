package com.highiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.highiq.dto.TalkTypeDeepReportRequest;
import com.highiq.dto.TalkTypeDeepReportResponse;
import com.highiq.enums.AiModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class TalkTypeReportService {
    private static final String BASIC_MODEL = AiModel.DEFAULT_MODEL;
    private static final int TALKTYPE_REPORT_MAX_TOKENS = 1200;

    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public TalkTypeReportService(AiService aiService, ObjectMapper objectMapper) {
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    public TalkTypeDeepReportResponse generateDeepReport(TalkTypeDeepReportRequest request) {
        try {
            String rawContent = aiService.generateText(buildPrompt(request), BASIC_MODEL, TALKTYPE_REPORT_MAX_TOKENS);
            TalkTypeDeepReportResponse response = parseResponse(stripJsonFence(rawContent));
            normalize(response);
            response.setModelUsed(BASIC_MODEL);
            response.setFallback(false);
            return response;
        } catch (Exception e) {
            log.warn("Failed to generate TalkType AI deep report, fallback will be used", e);
            return fallbackReport(request);
        }
    }

    private String buildPrompt(TalkTypeDeepReportRequest request) {
        return """
                你是一位温和、具体、克制的高情商沟通报告撰写者。请根据用户的 TalkType 测评结果，生成一份让用户觉得“像我”的中文深度报告。

                要求：
                1. 不要使用心理诊断、医学诊断或绝对化判断。
                2. 多用“你可能”“你常常”“在某些关系里”，不要写“你一定”“你永远”。
                3. 具体、有生活画面感，避免玄学化、鸡汤化。
                4. 每段 80-140 字，适合移动端阅读。
                5. 只输出 JSON，不要 Markdown，不要解释。

                JSON 格式：
                {
                  "hiddenPattern": "string",
                  "innerNeed": "string",
                  "triggerPhrases": ["string", "string", "string"],
                  "misreadByOthers": "string",
                  "relationshipNotes": {
                    "relationship": "string",
                    "workplace": "string",
                    "friendship": "string"
                  },
                  "growthSuggestion": "string",
                  "practicePrompts": ["string", "string", "string"]
                }

                测评结果：
                - 人格：%s（%s）
                - 沟通代码：%s
                - 成熟度：%s
                - 四维分数：%s
                - 优势：%s
                - 盲区：%s
                - 训练方向：%s
                - 亲密关系表现：%s
                - 职场表现：%s
                - 朋友相处表现：%s
                """.formatted(
                safe(request.getPersonalityName()),
                safe(request.getCodeName()),
                safe(request.getCommunicationCode()),
                request.getMaturityScore() == null ? "未知" : request.getMaturityScore(),
                request.getDimensionScores(),
                request.getStrengths(),
                request.getBlindSpots(),
                request.getTrainingFocus(),
                safe(request.getRelationshipBehavior()),
                safe(request.getWorkplaceBehavior()),
                safe(request.getFriendshipBehavior())
        );
    }

    private String stripJsonFence(String rawContent) {
        if (rawContent == null) {
            throw new IllegalArgumentException("AI response is empty");
        }
        String content = rawContent.trim();
        if (content.startsWith("```")) {
            content = content.replaceFirst("^```(?:json)?\\s*", "");
            content = content.replaceFirst("\\s*```$", "");
        }
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }

    private TalkTypeDeepReportResponse parseResponse(String content) throws Exception {
        JsonNode root = objectMapper.copy()
                .configure(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature(), true)
                .readTree(content);

        return TalkTypeDeepReportResponse.builder()
                .hiddenPattern(text(root, "hiddenPattern"))
                .innerNeed(text(root, "innerNeed"))
                .triggerPhrases(textList(root.get("triggerPhrases")))
                .misreadByOthers(text(root, "misreadByOthers"))
                .relationshipNotes(textMap(root.get("relationshipNotes")))
                .growthSuggestion(text(root, "growthSuggestion"))
                .practicePrompts(textList(root.get("practicePrompts")))
                .build();
    }

    private String text(JsonNode root, String fieldName) {
        if (root == null || !root.has(fieldName)) {
            return "";
        }

        return nodeToText(root.get(fieldName));
    }

    private List<String> textList(JsonNode node) {
        if (node == null || node.isNull()) {
            return List.of();
        }

        List<String> values = new ArrayList<>();
        if (node.isArray()) {
            node.forEach((item) -> {
                String value = nodeToText(item);
                if (!value.isBlank()) {
                    values.add(value);
                }
            });
            return values;
        }

        String value = nodeToText(node);
        return value.isBlank() ? List.of() : List.of(value);
    }

    private Map<String, String> textMap(JsonNode node) {
        if (node == null || !node.isObject()) {
            return Map.of();
        }

        Map<String, String> values = new LinkedHashMap<>();
        node.fields().forEachRemaining((entry) -> {
            String value = nodeToText(entry.getValue());
            if (!value.isBlank()) {
                values.put(entry.getKey(), value);
            }
        });
        return values;
    }

    private String nodeToText(JsonNode node) {
        if (node == null || node.isNull()) {
            return "";
        }
        if (node.isTextual() || node.isNumber() || node.isBoolean()) {
            return node.asText();
        }
        if (node.isObject()) {
            for (String key : List.of("text", "content", "value", "body", "description", "suggestion")) {
                if (node.has(key)) {
                    String value = nodeToText(node.get(key));
                    if (!value.isBlank()) {
                        return value;
                    }
                }
            }
        }
        return node.toString();
    }

    private void normalize(TalkTypeDeepReportResponse response) {
        if (response.getTriggerPhrases() == null || response.getTriggerPhrases().isEmpty()) {
            response.setTriggerPhrases(List.of("你想太多了", "随便你吧", "我最近太忙了"));
        }
        if (response.getRelationshipNotes() == null || response.getRelationshipNotes().isEmpty()) {
            response.setRelationshipNotes(Map.of(
                    "relationship", "你在亲密关系里很在意回应的稳定性，也希望重要感受能被认真接住。",
                    "workplace", "你在职场沟通里适合维护协作节奏，把模糊的不安变成可处理的问题。",
                    "friendship", "朋友会感受到你的细心和照顾感，但你也需要避免总是单方面维持关系。"
            ));
        }
        if (response.getPracticePrompts() == null || response.getPracticePrompts().isEmpty()) {
            response.setPracticePrompts(List.of("表达自己的期待", "确认对方的真实需求", "练习温和但清楚的边界"));
        }
    }

    private TalkTypeDeepReportResponse fallbackReport(TalkTypeDeepReportRequest request) {
        String personalityName = safe(request.getPersonalityName());
        return TalkTypeDeepReportResponse.builder()
                .hiddenPattern("你的 " + personalityName + " 特质说明，你在沟通里不只是追求把话说对，也很在意关系能不能被好好接住。你可能会主动观察对方反应，尝试把误会、沉默或别扭重新变成可以谈的内容。")
                .innerNeed("你真正需要的不是每次都表现得完美，而是一种稳定、清楚、愿意互相回应的连接。只要对方愿意认真沟通，你通常也愿意把关系继续往好的方向带。")
                .triggerPhrases(List.of("你想太多了", "随便你吧", "我最近太忙了"))
                .misreadByOthers("别人可能只看到你会照顾场面，却没有意识到你也会累。你不是没有需求，只是常常先把话说得体，再慢慢处理自己的感受。")
                .relationshipNotes(Map.of(
                        "relationship", defaultText(request.getRelationshipBehavior(), "亲密关系里，你会在意细节和回应，也希望重要感受不要被轻轻带过。"),
                        "workplace", defaultText(request.getWorkplaceBehavior(), "职场里，你适合维护协作节奏，把模糊的不满或压力变成可以推进的问题。"),
                        "friendship", defaultText(request.getFriendshipBehavior(), "朋友会感受到你的可靠和细心，但你也需要确认这段关系不是只有你在用力。")
                ))
                .growthSuggestion("下次想把关系修好之前，先问自己一句：这次我是清楚表达需要，还是又在替双方承担沟通责任？")
                .practicePrompts(List.of("把期待说具体", "先确认事实再解读情绪", "用温和语气表达边界"))
                .modelUsed(BASIC_MODEL)
                .fallback(true)
                .build();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "未知" : value;
    }
}
