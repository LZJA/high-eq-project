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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI 服务类 - 调用 DeepSeek API
 */
@Slf4j
@Service
public class AiService {
    
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
        try {
            if (replyCount == null || replyCount <= 0) {
                replyCount = 3;
            }

            // 构建 Prompt
            String prompt = buildPrompt(chatContent, roleBackground, userIntent, replyCount, tone);

            // 调用 DeepSeek API
            Map<String, Object> response = callDeepSeekApi(prompt);

            // 解析响应
            return parseResponse(response);
        } catch (Exception e) {
            log.error("Failed to generate replies from AI", e);
            throw new RuntimeException("AI 服务调用失败: " + e.getMessage());
        }
    }
    
    /**
     * 构建 Prompt
     */
    private String buildPrompt(String chatContent, String roleBackground, String userIntent, Integer replyCount, String tone) {
        // 默认语气说明
        String toneInstruction = "语气要自然、得体";
        if (tone != null && !tone.isEmpty()) {
            switch (tone) {
                case "温和友善":
                    toneInstruction = "语气要温和友善，充满关怀和理解";
                    break;
                case "正式得体":
                    toneInstruction = "语气要正式得体，保持专业和礼貌";
                    break;
                case "幽默风趣":
                    toneInstruction = "语气要幽默风趣，可以适当使用轻松的表达方式";
                    break;
                case "真诚直接":
                    toneInstruction = "语气要真诚直接，坦率表达自己的想法";
                    break;
                case "委婉含蓄":
                    toneInstruction = "语气要委婉含蓄，用间接的方式表达意思";
                    break;
                default:
                    toneInstruction = "语气要" + tone;
            }
        }

        return String.format(
                "# 角色设定\n" +
                "你是一位专业的情商沟通顾问，擅长在各种社交场景中提供得体、有效的回复建议。\n\n" +
                "# 场景信息\n" +
                "- 对方身份：%s\n" +
                "- 对方消息：\"%s\"\n" +
                "- 你的真实意图：%s\n\n" +
                "# 回复要求\n" +
                "请生成 %d 条回复建议，遵循以下原则：\n\n" +
                "1. **共情优先**：先理解对方情绪，给予恰当回应\n" +
                "2. **表达真诚**：%s\n" +
                "3. **言简意赅**：20-80字，避免冗长\n" +
                "4. **灵活应变**：根据对方身份调整措辞\n" +
                "5. **积极导向**：即使拒绝也要维护关系\n\n" +
                "# 输出格式\n" +
                "请按以下格式输出每条建议，用 === 分隔不同建议：\n\n" +
                "【回复内容】\n" +
                "回复的文字内容\n" +
                "【推荐理由】\n" +
                "这条建议为什么有效，它好在哪里，适合什么情况\n\n" +
                "（每条建议都包含【回复内容】和【推荐理由】两部分）\n\n" +
                "--- 开始生成 ---",
                roleBackground, chatContent, userIntent, replyCount, toneInstruction, replyCount
        );
    }
    
    /**
     * 调用 DeepSeek API
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> callDeepSeekApi(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("temperature", temperature);
        requestBody.put("max_tokens", maxTokens);
        
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
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> choice = choices.get(0);
                Map<String, Object> message = (Map<String, Object>) choice.get("message");
                String content = (String) message.get("content");

                // 按 === 分隔符分割不同建议
                String[] suggestions = content.split("===");

                for (String suggestion : suggestions) {
                    // 提取【回复内容】和【推荐理由】
                    String contentPart = extractSection(suggestion, "【回复内容】", "【推荐理由】");
                    String reasonPart = extractSection(suggestion, "【推荐理由】", null);

                    // 只返回回复内容部分（推荐理由在前端需要时可以单独解析）
                    if (contentPart != null && !contentPart.trim().isEmpty()) {
                        // 将回复内容和推荐理由用特殊标记组合，后续 ReplyService 会解析
                        String combined = contentPart.trim() + "|||REASON|||" +
                                (reasonPart != null ? reasonPart.trim() : "高情商回复，能得体地表达意图");
                        replies.add(combined);
                    }
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
