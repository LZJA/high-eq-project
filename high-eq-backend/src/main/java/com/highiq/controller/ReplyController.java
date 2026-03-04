package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import com.highiq.dto.HistoryDTO;
import com.highiq.dto.PageResponse;
import com.highiq.service.ReplyService;
import com.highiq.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 回复生成控制器
 */
@Slf4j
@RestController
@RequestMapping("/reply")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReplyController {
    
    private final ReplyService replyService;
    private final JwtUtil jwtUtil;
    
    public ReplyController(ReplyService replyService, JwtUtil jwtUtil) {
        this.replyService = replyService;
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * 生成高情商回复
     */
    @PostMapping("/generate")
    public ApiResponse<GenerateReplyResponse> generateReplies(
            @Valid @RequestBody GenerateReplyRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            
            GenerateReplyResponse response = replyService.generateReplies(userId, request);
            return ApiResponse.success("回复生成成功", response);
        } catch (Exception e) {
            log.error("Failed to generate replies", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
    
    /**
     * 获取用户历史记录（分页）
     */
    @GetMapping("/history")
    public ApiResponse<PageResponse<HistoryDTO>> getHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);

            PageResponse<HistoryDTO> pageResponse = replyService.getUserHistory(userId, page, size);
            return ApiResponse.success("获取成功", pageResponse);
        } catch (Exception e) {
            log.error("Failed to get history", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
    
    /**
     * 获取历史记录详情
     */
    @GetMapping("/history/{historyId}")
    public ApiResponse<HistoryDTO> getHistoryDetail(
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            
            HistoryDTO history = replyService.getHistoryDetail(historyId, userId);
            return ApiResponse.success("获取成功", history);
        } catch (Exception e) {
            log.error("Failed to get history detail", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
    
    /**
     * 获取历史记录的回复建议
     */
    @GetMapping("/history/{historyId}/suggestions")
    public ApiResponse<List<String>> getHistorySuggestions(
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            
            List<String> suggestions = replyService.getHistorySuggestions(historyId, userId);
            return ApiResponse.success("获取成功", suggestions);
        } catch (Exception e) {
            log.error("Failed to get suggestions", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
    
    /**
     * 删除历史记录
     */
    @DeleteMapping("/history/{historyId}")
    public ApiResponse<Void> deleteHistory(
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            
            replyService.deleteHistory(historyId, userId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            log.error("Failed to delete history", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
    
    /**
     * 收藏/取消收藏历史记录
     */
    @PostMapping("/history/{historyId}/favorite")
    public ApiResponse<Void> toggleFavorite(
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            
            replyService.toggleFavorite(historyId, userId);
            return ApiResponse.success("操作成功", null);
        } catch (Exception e) {
            log.error("Failed to toggle favorite", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
    
    /**
     * 获取收藏的历史记录
     */
    @GetMapping("/history/favorite")
    public ApiResponse<List<HistoryDTO>> getFavoriteHistory(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            
            List<HistoryDTO> favorites = replyService.getFavoriteHistory(userId);
            return ApiResponse.success("获取成功", favorites);
        } catch (Exception e) {
            log.error("Failed to get favorite history", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
