package com.highiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    private String buildPrompt(String chatContent, String roleBackground, String userIntent, Integer replyCount, String tone) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个高情商沟通助手。请根据以下信息生成").append(replyCount).append("条得体的回复建议。\n\n");

        if (chatContent != null && !chatContent.isEmpty()) {
            prompt.append("对方说：").append(chatContent).append("\n");
        } else {
            prompt.append("请从图片中提取对方的聊天内容。\n");
        }

        prompt.append("对方角色：").append(roleBackground).append("\n");
        prompt.append("我的意图：").append(userIntent).append("\n");

        if (tone != null && !tone.isEmpty()) {
            prompt.append("期望语气：").append(tone).append("\n");
        }

        prompt.append("\n请生成").append(replyCount).append("条回复，每条回复严格按照以下格式输出（不要有其他内容）：\n");
        prompt.append("回复内容|||REASON|||推荐理由\n\n");
        prompt.append("每条回复单独一行，不要添加序号或其他标记。");

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
        requestBody.put("model", "qwen-vl-plus");
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
            return List.of("抱歉，生成回复失败，请重试|||REASON|||响应解析失败");
        }

        return replies;
    }
}
