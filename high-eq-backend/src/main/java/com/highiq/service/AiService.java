package com.highiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI 服务类 - 调用 DeepSeek API
 */
@Slf4j
@Service
public class AiService {
    public static final int DEFAULT_REPLY_COUNT = 5;
    private static final int REPLY_MAX_TOKENS = 1800;
    
    @Value("${ai.deepseek.api-key}")
    private String apiKey;
    
    @Value("${ai.deepseek.api-url}")
    private String apiUrl;
    
    @Value("${ai.deepseek.model}")
    private String model;
    
    @Value("${ai.deepseek.temperature}")
    private Double temperature;
    
    @Value("${ai.deepseek.max-tokens}")
    private Integer maxTokens;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public AiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    
    /**
     * 生成高情商回复
     *
     * @param chatContent 对方的聊天内容
     * @param roleBackground 角色背景
     * @param userIntent 用户真实意图
     * @param replyCount 生成回复的数量
     * @param tone 语气/风格（可选）
     * @return 回复建议列表
     */
    public List<String> generateReplies(String chatContent, String roleBackground, String userIntent, Integer replyCount, String tone) {
        return generateReplies(chatContent, roleBackground, userIntent, replyCount, tone, model);
    }

    public String generateText(String prompt, String requestedModel) {
        return generateText(prompt, requestedModel, null);
    }

    public String generateText(String prompt, String requestedModel, Integer maxTokensOverride) {
        try {
            Map<String, Object> response = callDeepSeekApi(prompt, requestedModel, maxTokensOverride);
            return extractContent(response);
        } catch (Exception e) {
            log.error("Failed to generate text from AI", e);
            throw new RuntimeException("AI 文本生成失败: " + e.getMessage());
        }
    }

    public List<String> generateReplies(String chatContent, String roleBackground, String userIntent, Integer replyCount, String tone, String requestedModel) {
        try {
            int fixedReplyCount = DEFAULT_REPLY_COUNT;

            // 构建 Prompt
            String prompt = buildPrompt(chatContent, roleBackground, userIntent, fixedReplyCount);

            return callAndParseReplies(prompt, requestedModel, fixedReplyCount);
        } catch (Exception e) {
            log.error("Failed to generate replies from AI", e);
            throw new RuntimeException("AI 服务调用失败: " + e.getMessage());
        }
    }
    
    /**
     * 构建 Prompt
     */
    private String buildPrompt(String chatContent, String roleBackground, String userIntent, Integer replyCount) {
        return String.format(
                "# 角色设定\n" +
                "你是一位专业的情商沟通顾问，擅长在各种社交场景中提供得体、有效的回复建议。\n\n" +
                "回复内容要像用户可以直接发出去的微信/私聊消息，保留生活感和人情味。\n" +
                "避免过于官方、客服式、说教式或像 AI 总结的表达。\n\n" +
                "# 场景信息\n" +
                "- 对方信息：%s\n" +
                "- 对方消息：\"%s\"\n" +
                "- 你的真实意图：%s\n\n" +
                "# 回复要求\n" +
                "请生成 %d 条回复建议，遵循以下原则：\n\n" +
                "0. **数量必须严格等于 %d 条**：必须填满 JSON 数组里的 5 个对象；不能只输出 3 条，也不要输出 6 条\n" +
                "1. **了解对方**：仔细分析对方的性格、兴趣、关系等信息，生成符合对方特点的回复\n" +
                "2. **共情优先**：先理解对方情绪，给予恰当回应\n" +
                "3. **表达真诚**：基于用户真实意图表达，不虚假、不油腻\n" +
                "4. **言简意赅**：20-80字，避免冗长\n" +
                "5. **灵活应变**：根据对方身份、性格调整措辞和表达方式\n" +
                "6. **积极导向**：即使拒绝也要维护关系\n" +
                "7. **风格分明**：%d 条建议要体现不同沟通策略，每条的风格标签必须不同\n\n" +
                "# 风格标签要求\n" +
                "请根据对方信息、关系、消息语境和这条回复的沟通策略，为每条回复生成一个 2-6 个中文字的短标签。\n" +
                "标签要灵活贴合场景，例如“温柔体贴”“俏皮亲密”“稳重安心”“专业周全”，但不要固定套用示例。\n\n" +
                "# 输出格式\n" +
                "只输出 JSON 数组，不要输出 Markdown、编号、解释或任何额外文字。\n" +
                "JSON 数组长度必须严格等于 %d；即使语境简单，也要从不同沟通策略补足 5 条。\n" +
                "每个元素必须包含 content、reason、styleLabel 三个字符串字段。\n" +
                "reason 控制在 8-24 个中文字，避免过长导致输出截断。\n" +
                "请严格按下面 5 个对象的骨架填充，保留 5 个数组元素：\n" +
                "[\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"}\n" +
                "]",
                roleBackground, chatContent, userIntent,
                replyCount,
                replyCount,
                replyCount,
                replyCount
        );
    }

    public List<String> generateRegeneratedReplies(String chatContent, String roleBackground, String userIntent,
                                                   String requestedModel, List<String> excludeContents) {
        String prompt = buildPrompt(chatContent, roleBackground, userIntent, DEFAULT_REPLY_COUNT) +
                "\n\n# 已生成过的回复，新的回复不要重复这些表达和角度\n" +
                formatExcludedContents(excludeContents) +
                "\n请换一批新的表达方式，仍然贴合对方关系和用户真实意图。不要只是替换几个同义词。";
        return callAndParseReplies(prompt, requestedModel, DEFAULT_REPLY_COUNT);
    }

    public List<String> generateContinueChatReplies(String roleBackground, String initialChatContent,
                                                    String initialUserIntent, String sessionSummary,
                                                    List<String> recentMessages, String opponentMessage,
                                                    String userIntent, String requestedModel,
                                                    List<String> excludeContents) {
        String prompt = buildContinueChatPrompt(roleBackground, initialChatContent, initialUserIntent,
                sessionSummary, recentMessages, opponentMessage, userIntent, excludeContents);
        return callAndParseReplies(prompt, requestedModel, DEFAULT_REPLY_COUNT);
    }

    private List<String> callAndParseReplies(String prompt, String requestedModel, int expectedCount) {
        Map<String, Object> response = callDeepSeekApi(prompt, requestedModel, REPLY_MAX_TOKENS);
        List<String> replies = parseResponse(response);
        if (replies.size() >= expectedCount) {
            return replies.subList(0, expectedCount);
        }

        log.warn("AI returned {} replies, expected {}. Returning parsed replies without supplement call.",
                replies.size(), expectedCount);
        return replies;
    }

    private String buildContinueChatPrompt(String roleBackground, String initialChatContent, String initialUserIntent,
                                           String sessionSummary, List<String> recentMessages, String opponentMessage,
                                           String userIntent, List<String> excludeContents) {
        return String.format(
                "# 角色设定\n" +
                "你是一位专业的情商沟通顾问。你要基于已经发生的真实聊天，帮用户生成下一句可以直接发出去的微信/私聊回复。\n" +
                "回复要自然、有生活感和人情味，避免官方、客服式、心理咨询式、说教式或像 AI 总结的表达。\n\n" +
                "# 关系背景\n" +
                "对方信息：%s\n" +
                "本次会话最开始对方说：\"%s\"\n" +
                "用户最初真实意图：%s\n\n" +
                "# 会话摘要\n%s\n\n" +
                "# 最近对话\n%s\n\n" +
                "# 对方最新消息\n\"%s\"\n\n" +
                "# 用户这次真实想法\n%s\n\n" +
                "# 已生成过的候选，新的回复不要重复这些表达和角度\n%s\n\n" +
                "# 回复要求\n" +
                "生成 5 条候选。\n" +
                "1. 优先回应对方最新消息里的情绪、关心、疑问或担忧。\n" +
                "2. 不要重复用户已经说过的话。\n" +
                "3. 不要推翻用户已经确认发送过的内容。\n" +
                "4. 如果用户补充了这次真实想法，以这次真实想法为准。\n" +
                "5. 每条 20-80 字，像可以直接发出去的聊天消息。\n" +
                "6. 5 条候选必须体现不同回复策略，每条使用不同的风格标签。\n\n" +
                "# 输出格式\n" +
                "只输出 JSON 数组，不要输出 Markdown、编号、解释或任何额外文字。\n" +
                "JSON 数组长度必须严格等于 5；即使语境简单，也要从不同沟通策略补足 5 条。\n" +
                "每个元素必须包含 content、reason、styleLabel 三个字符串字段。\n" +
                "reason 控制在 8-24 个中文字，避免过长导致输出截断。\n" +
                "请严格按下面 5 个对象的骨架填充，保留 5 个数组元素：\n" +
                "[\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"},\n" +
                "  {\"styleLabel\":\"\",\"content\":\"\",\"reason\":\"\"}\n" +
                "]\n",
                nullToFallback(roleBackground, "未提供"),
                nullToFallback(initialChatContent, "未提供"),
                nullToFallback(initialUserIntent, "未提供"),
                nullToFallback(sessionSummary, "暂无"),
                recentMessages == null || recentMessages.isEmpty() ? "暂无" : String.join("\n", recentMessages),
                nullToFallback(opponentMessage, ""),
                nullToFallback(userIntent, "未补充，以自然回应对方最新消息为准"),
                formatExcludedContents(excludeContents)
        );
    }

    private String formatExcludedContents(List<String> excludeContents) {
        if (excludeContents == null || excludeContents.isEmpty()) {
            return "暂无";
        }
        StringBuilder builder = new StringBuilder();
        for (String content : excludeContents) {
            if (content != null && !content.isBlank()) {
                builder.append("- ").append(content.trim()).append('\n');
            }
        }
        return builder.length() == 0 ? "暂无" : builder.toString();
    }

    private String nullToFallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
    
    /**
     * 调用 DeepSeek API
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> callDeepSeekApi(String prompt) {
        return callDeepSeekApi(prompt, model);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callDeepSeekApi(String prompt, String requestedModel) {
        return callDeepSeekApi(prompt, requestedModel, null);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callDeepSeekApi(String prompt, String requestedModel, Integer maxTokensOverride) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", requestedModel);
        requestBody.put("temperature", temperature);
        requestBody.put("max_tokens", maxTokensOverride == null ? maxTokens : maxTokensOverride);

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        messages.add(message);
        requestBody.put("messages", messages);

        try {
            String response = webClient.post()
                    .uri(apiUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return objectMapper.readValue(response, Map.class);
        } catch (Exception e) {
            log.error("DeepSeek API call failed", e);
            throw new RuntimeException("调用 DeepSeek API 失败: " + e.getMessage());
        }
    }
    
    /**
     * 解析 AI 响应，提取回复内容和推荐理由
     */
    @SuppressWarnings("unchecked")
    private List<String> parseResponse(Map<String, Object> response) {
        List<String> replies = new ArrayList<>();

        try {
            String content = extractContent(response);
            List<String> jsonReplies = parseJsonSuggestions(content);
            if (!jsonReplies.isEmpty()) {
                return jsonReplies;
            }

            for (String suggestion : splitSuggestionBlocks(content)) {
                // 提取【回复内容】、【推荐理由】和【风格标签】
                String contentPart = extractSection(suggestion, "【回复内容】", "【推荐理由】");
                String reasonPart = extractSection(suggestion, "【推荐理由】", "【风格标签】");
                if (reasonPart == null) {
                    reasonPart = extractSection(suggestion, "【推荐理由】", null);
                }
                String stylePart = extractSection(suggestion, "【风格标签】", null);

                if (contentPart != null && !contentPart.trim().isEmpty()) {
                    String combined = contentPart.trim() + "|||REASON|||" +
                            (reasonPart != null ? reasonPart.trim() : ReplyStyleLabelParser.DEFAULT_REASON) +
                            "|||STYLE|||" +
                            (stylePart != null ? stylePart.trim() : ReplyStyleLabelParser.DEFAULT_STYLE_LABEL);
                    replies.add(combined);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse AI response", e);
            // 如果解析失败，尝试直接返回整个响应
            if (response.containsKey("choices")) {
                replies.add(response.toString());
            }
        }

        return replies;
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJsonSuggestions(String content) {
        List<String> replies = new ArrayList<>();
        String json = extractJsonArray(content);
        if (json == null) {
            return replies;
        }

        try {
            List<Map<String, Object>> suggestions = objectMapper.readValue(json, List.class);
            for (Map<String, Object> suggestion : suggestions) {
                String contentPart = stringValue(suggestion.get("content"));
                if (contentPart.isBlank()) {
                    continue;
                }
                String reasonPart = stringValue(suggestion.get("reason"));
                String stylePart = stringValue(suggestion.get("styleLabel"));
                replies.add(contentPart + "|||REASON|||" +
                        (reasonPart.isBlank() ? ReplyStyleLabelParser.DEFAULT_REASON : reasonPart) +
                        "|||STYLE|||" +
                        (stylePart.isBlank() ? ReplyStyleLabelParser.DEFAULT_STYLE_LABEL : stylePart));
            }
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON suggestions, fallback to section parser: {}", e.getMessage());
        }
        return replies;
    }

    private String extractJsonArray(String content) {
        String trimmed = content == null ? "" : content.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "").trim();
        }
        int start = trimmed.indexOf('[');
        int end = trimmed.lastIndexOf(']');
        if (start < 0 || end <= start) {
            return null;
        }
        return trimmed.substring(start, end + 1);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private List<String> splitSuggestionBlocks(String content) {
        List<String> blocks = new ArrayList<>();
        String marker = "【回复内容】";
        int firstMarkerIndex = content.indexOf(marker);
        if (firstMarkerIndex >= 0) {
            int start = firstMarkerIndex;
            while (start >= 0) {
                int next = content.indexOf(marker, start + marker.length());
                String block = next >= 0 ? content.substring(start, next) : content.substring(start);
                if (!block.isBlank()) {
                    blocks.add(block);
                }
                start = next;
            }
            return blocks;
        }

        String[] suggestions = content.split("===");
        for (String suggestion : suggestions) {
            if (!suggestion.isBlank()) {
                blocks.add(suggestion);
            }
        }
        return blocks;
    }

    @SuppressWarnings("unchecked")
    private String extractContent(Map<String, Object> response) {
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new IllegalArgumentException("AI 响应中没有 choices");
        }

        Map<String, Object> choice = choices.get(0);
        Map<String, Object> message = (Map<String, Object>) choice.get("message");
        if (message == null || message.get("content") == null) {
            throw new IllegalArgumentException("AI 响应中没有 message.content");
        }

        return (String) message.get("content");
    }

    /**
     * 从文本中提取指定标签之间的内容
     */
    private String extractSection(String text, String startTag, String endTag) {
        int startIndex = text.indexOf(startTag);
        if (startIndex == -1) return null;

        startIndex += startTag.length();

        if (endTag != null) {
            int endIndex = text.indexOf(endTag, startIndex);
            if (endIndex == -1) return null;
            return text.substring(startIndex, endIndex).trim();
        } else {
            // 没有结束标签，取到文本末尾
            return text.substring(startIndex).trim();
        }
    }
}
