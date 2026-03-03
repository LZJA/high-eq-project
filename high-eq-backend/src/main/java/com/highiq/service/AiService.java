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
     * @return 回复建议列表
     */
    public List<String> generateReplies(String chatContent, String roleBackground, String userIntent, Integer replyCount) {
        try {
            if (replyCount == null || replyCount <= 0) {
                replyCount = 3;
            }
            
            // 构建 Prompt
            String prompt = buildPrompt(chatContent, roleBackground, userIntent, replyCount);
            
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
    private String buildPrompt(String chatContent, String roleBackground, String userIntent, Integer replyCount) {
        return String.format(
                "你是一个高情商的沟通助手。现在，你的%s给你发来了消息：\n\n\"%s\"\n\n" +
                "你希望表达的真实意图是：\"%s\"\n\n" +
                "请你根据这些信息，生成 %d 条高情商的回复建议。要求如下：\n" +
                "1. 每条回复都要既表达你的真实想法，又要照顾对方的感受\n" +
                "2. 语气要自然、得体，避免生硬或过度委婉\n" +
                "3. 长度适中，通常 20-100 字之间\n" +
                "4. 可以适当使用表情符号或语气词\n\n" +
                "请按照以下格式返回，每条建议用 \"---\" 分隔：\n" +
                "建议1\n---\n建议2\n---\n建议3\n\n" +
                "现在开始生成回复建议：",
                roleBackground, chatContent, userIntent, replyCount
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
     * 解析 API 响应
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
                
                // 按 "---" 分隔符分割回复
                String[] suggestions = content.split("---");
                for (String suggestion : suggestions) {
                    String trimmed = suggestion.trim();
                    if (!trimmed.isEmpty()) {
                        replies.add(trimmed);
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
}
