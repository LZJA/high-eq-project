package com.highiq.controller;

import com.highiq.dto.AdoptChatSuggestionRequest;
import com.highiq.dto.ApiResponse;
import com.highiq.dto.CreateReplyChatSessionRequest;
import com.highiq.dto.GenerateChatSuggestionsRequest;
import com.highiq.dto.GenerateChatSuggestionsResponse;
import com.highiq.dto.ReplyChatSessionDTO;
import com.highiq.service.ReplyChatSessionService;
import com.highiq.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/reply/chat-sessions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReplyChatSessionController {

    private final ReplyChatSessionService chatSessionService;
    private final JwtUtil jwtUtil;

    public ReplyChatSessionController(ReplyChatSessionService chatSessionService, JwtUtil jwtUtil) {
        this.chatSessionService = chatSessionService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ApiResponse<ReplyChatSessionDTO> createSession(
            @Valid @RequestBody CreateReplyChatSessionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = getUserId(authHeader);
            return ApiResponse.success("继续聊会话创建成功", chatSessionService.createSession(userId, request));
        } catch (Exception e) {
            log.error("Failed to create reply chat session", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/{sessionId}")
    public ApiResponse<ReplyChatSessionDTO> getSession(
            @PathVariable String sessionId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = getUserId(authHeader);
            return ApiResponse.success("获取成功", chatSessionService.getSession(userId, sessionId));
        } catch (Exception e) {
            log.error("Failed to get reply chat session", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{sessionId}/suggestions")
    public ApiResponse<GenerateChatSuggestionsResponse> generateSuggestions(
            @PathVariable String sessionId,
            @Valid @RequestBody GenerateChatSuggestionsRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = getUserId(authHeader);
            return ApiResponse.success("回复生成成功", chatSessionService.generateSuggestions(userId, sessionId, request));
        } catch (Exception e) {
            log.error("Failed to generate reply chat suggestions", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{sessionId}/suggestions/regenerate")
    public ApiResponse<GenerateChatSuggestionsResponse> regenerateSuggestions(
            @PathVariable String sessionId,
            @RequestBody(required = false) GenerateChatSuggestionsRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = getUserId(authHeader);
            return ApiResponse.success("换一批成功", chatSessionService.regenerateLatestSuggestions(userId, sessionId, request));
        } catch (Exception e) {
            log.error("Failed to regenerate reply chat suggestions", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @PostMapping("/{sessionId}/adopt")
    public ApiResponse<ReplyChatSessionDTO> adoptSuggestion(
            @PathVariable String sessionId,
            @Valid @RequestBody AdoptChatSuggestionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = getUserId(authHeader);
            return ApiResponse.success("保存成功", chatSessionService.adoptSuggestion(userId, sessionId, request));
        } catch (Exception e) {
            log.error("Failed to adopt reply chat suggestion", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    private String getUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(token);
    }
}
