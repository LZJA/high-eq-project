package com.highiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
public class DoubaoVisionService {

    @Value("${ai.doubao.api-key:}")
    private String apiKey;

    @Value("${ai.doubao.api-url:https://ark.cn-beijing.volces.com/api/v3}")
    private String apiUrl;

    @Value("${ai.doubao.model:doubao-seed-1-8-251228}")
    private String model;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public DoubaoVisionService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public List<String> generateRepliesWithImage(String chatImage, String chatContent, String roleBackground,
                                                  String userIntent, Integer replyCount, String tone) {
        try {
            String prompt = buildPrompt(chatContent, roleBackground, userIntent, replyCount, tone);
            Map<String, Object> response = callDoubaoVisionApi(prompt, chatImage);
            return parseResponse(response);
        } catch (Exception e) {
            log.error("Failed to generate replies from Doubao Vision", e);
            throw new RuntimeException("豆包视觉服务调用失败: " + e.getMessage());
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

    private Map<String, Object> callDoubaoVisionApi(String prompt, String imageBase64) {
        List<Map<String, Object>> input = new ArrayList<>();
        Map<String, Object> userInput = new HashMap<>();
        userInput.put("role", "user");

        List<Object> content = new ArrayList<>();

        if (imageBase64 != null && !imageBase64.isEmpty()) {
            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "input_image");
            imageContent.put("image_url", imageBase64);
            content.add(imageContent);
        }

        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "input_text");
        textContent.put("text", prompt);
        content.add(textContent);

        userInput.put("content", content);
        input.add(userInput);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("input", input);

        log.info("Calling Doubao API: {}", apiUrl + "/responses");
        log.debug("Request body: {}", requestBody);

        try {
            Map<String, Object> response = webClient.post()
                    .uri(apiUrl + "/responses")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Doubao API response received");
            log.info("Full Response: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Doubao API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("豆包API调用失败: " + e.getMessage(), e);
        }
    }

    private List<String> parseResponse(Map<String, Object> response) {
        List<String> replies = new ArrayList<>();

        try {
            List<Map<String, Object>> output = (List<Map<String, Object>>) response.get("output");
            if (output != null && output.size() > 1) {
                Map<String, Object> message = output.get(1);
                if ("message".equals(message.get("type"))) {
                    List<Map<String, Object>> content = (List<Map<String, Object>>) message.get("content");
                    if (content != null && !content.isEmpty()) {
                        String text = (String) content.get(0).get("text");

                        log.info("Parsing Doubao response content: {}", text);

                        String[] lines = text.split("\n");
                        for (String line : lines) {
                            line = line.trim();
                            if (!line.isEmpty() && line.contains("|||REASON|||")) {
                                replies.add(line);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Doubao response", e);
        }

        if (replies.isEmpty()) {
            log.warn("No valid replies parsed from Doubao response");
            return List.of("抱歉，生成回复失败，请重试|||REASON|||响应解析失败");
        }

        return replies;
    }
}
