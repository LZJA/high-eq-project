package com.highiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.highiq.enums.AiModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
public class QwenVisionService {

    @Value("${ai.qwen.api-key:}")
    private String apiKey;

    @Value("${ai.qwen.api-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public QwenVisionService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public List<String> generateRepliesWithImage(String chatImage, String chatContent, String roleBackground,
                                                  String userIntent, Integer replyCount, String tone) {
        try {
            String prompt = buildPrompt(chatContent, roleBackground, userIntent, replyCount, tone);
            Map<String, Object> response = callQwenVisionApi(prompt, chatImage);
            return parseResponse(response);
        } catch (Exception e) {
            log.error("Failed to generate replies from Qwen Vision", e);
            throw new RuntimeException("通义千问视觉服务调用失败: " + e.getMessage());
        }
    }

    public ContinueChatGeneration generateContinueChatWithImage(String chatImage, String opponentHint,
                                                                String roleBackground, String initialChatContent,
                                                                String initialUserIntent, String sessionSummary,
                                                                List<String> recentMessages, String userIntent,
                                                                List<String> excludeContents) {
        try {
            String prompt = buildContinueChatPrompt(opponentHint, roleBackground, initialChatContent,
                    initialUserIntent, sessionSummary, recentMessages, userIntent, excludeContents);
            Map<String, Object> response = callQwenVisionApi(prompt, chatImage);
            return parseContinueChatResponse(response);
        } catch (Exception e) {
            log.error("Failed to generate continue chat replies from Qwen Vision", e);
            throw new RuntimeException("通义千问视觉服务调用失败: " + e.getMessage());
        }
    }

    private String buildPrompt(String chatContent, String roleBackground, String userIntent, Integer replyCount, String tone) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个高情商沟通助手。请根据以下信息生成").append(replyCount).append("条得体的回复建议。\n\n");
        prompt.append("回复要像可以直接发出去的微信/私聊消息，保留生活感和人情味，避免官方、客服式或说教式表达。\n\n");

        if (chatContent != null && !chatContent.isEmpty()) {
            prompt.append("对方说：").append(chatContent).append("\n");
        } else {
            prompt.append("请从图片中提取对方的聊天内容。\n");
        }

        prompt.append("对方角色：").append(roleBackground).append("\n");
        prompt.append("我的意图：").append(userIntent).append("\n");

        prompt.append("\n请生成").append(replyCount).append("条回复，每条回复严格按照以下格式输出（不要有其他内容）：\n");
        prompt.append("回复内容|||REASON|||推荐理由|||STYLE|||风格标签\n\n");
        prompt.append("风格标签要根据对方角色、关系、消息语境和回复策略灵活生成，2-6个中文字；").append(replyCount).append("条回复的风格标签不能重复。\n");
        prompt.append("每条回复单独一行，不要添加序号或其他标记。");

        return prompt.toString();
    }

    private String buildContinueChatPrompt(String opponentHint, String roleBackground, String initialChatContent,
                                           String initialUserIntent, String sessionSummary, List<String> recentMessages,
                                           String userIntent, List<String> excludeContents) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个高情商沟通助手。请先识别聊天截图里对方最近表达了什么，再基于上下文生成 5 条用户可以直接发出的回复建议。\n");
        prompt.append("回复要自然、有生活感和人情味，避免官方、客服式、心理咨询式、说教式或像 AI 总结。\n\n");
        prompt.append("# 对方角色\n").append(nullToFallback(roleBackground, "未提供")).append("\n\n");
        prompt.append("# 本段继续聊起点\n对方最开始说：").append(nullToFallback(initialChatContent, "未提供")).append("\n");
        prompt.append("用户最初真实意图：").append(nullToFallback(initialUserIntent, "未提供")).append("\n\n");
        prompt.append("# 旧对话摘要\n").append(nullToFallback(sessionSummary, "暂无")).append("\n\n");
        prompt.append("# 最近对话\n").append(recentMessages == null || recentMessages.isEmpty() ? "暂无" : String.join("\n", recentMessages)).append("\n\n");
        prompt.append("# 用户补充的对方表达提示\n").append(nullToFallback(opponentHint, "未补充，请以截图识别为准")).append("\n\n");
        prompt.append("# 用户这次真实想法\n").append(nullToFallback(userIntent, "未补充，以自然回应对方为准")).append("\n\n");
        prompt.append("# 已生成过的候选，新的回复不要重复这些表达和角度\n").append(formatExcludedContents(excludeContents)).append("\n\n");
        prompt.append("# 输出格式\n");
        prompt.append("第一行输出：OPPONENT_SUMMARY|||对方说了什么的简洁摘要，保留对方原意，不要写成“对方总结”。\n");
        prompt.append("后面严格输出 5 行回复，每行格式：回复内容|||REASON|||推荐理由|||STYLE|||风格标签\n");
        prompt.append("风格标签根据对方角色、关系、图片语境和回复策略灵活生成，2-6 个中文字，5 条不能重复。\n");
        prompt.append("每条回复 20-80 字。不要输出 Markdown、编号或额外解释。");
        return prompt.toString();
    }

    private Map<String, Object> callQwenVisionApi(String prompt, String imageBase64) {
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");

        List<Object> content = new ArrayList<>();

        if (imageBase64 != null && !imageBase64.isEmpty()) {
            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            Map<String, String> imageUrl = new HashMap<>();
            imageUrl.put("url", imageBase64);
            imageContent.put("image_url", imageUrl);
            content.add(imageContent);
        }

        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        content.add(textContent);

        userMessage.put("content", content);
        messages.add(userMessage);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", AiModel.QWEN3_VL_PLUS.getId());
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 2000);

        return webClient.post()
                .uri(apiUrl + "/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private List<String> parseResponse(Map<String, Object> response) {
        List<String> replies = new ArrayList<>();

        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");

                log.info("Parsing Qwen response content: {}", content);

                String[] lines = content.split("\n");
                for (String line : lines) {
                    line = line.trim();
                    if (!line.isEmpty() && line.contains("|||REASON|||")) {
                        replies.add(line);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Qwen response", e);
        }

        if (replies.isEmpty()) {
            log.warn("No valid replies parsed from Qwen response");
            return List.of("抱歉，生成回复失败，请重试|||REASON|||响应解析失败|||STYLE|||自然得体");
        }

        return replies;
    }

    @SuppressWarnings("unchecked")
    private ContinueChatGeneration parseContinueChatResponse(Map<String, Object> response) {
        String opponentSummary = "";
        List<String> replies = new ArrayList<>();

        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");
                String[] lines = content.split("\n");
                for (String line : lines) {
                    line = line.trim();
                    if (line.startsWith("OPPONENT_SUMMARY|||")) {
                        opponentSummary = line.substring("OPPONENT_SUMMARY|||".length()).trim();
                    } else if (!line.isEmpty() && line.contains("|||REASON|||")) {
                        replies.add(line);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Qwen continue chat response", e);
        }

        if (opponentSummary.isBlank()) {
            opponentSummary = "已根据聊天截图识别对方说了什么";
        }
        if (replies.isEmpty()) {
            replies = List.of("我看到了，我先顺着你的意思认真回一下，别让话赶话把事情说僵。|||REASON|||先稳住对话氛围|||STYLE|||稳住情绪");
        }
        return new ContinueChatGeneration(opponentSummary, replies);
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
}
