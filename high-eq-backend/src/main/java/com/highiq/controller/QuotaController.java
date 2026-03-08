package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.QuotaStatusDTO;
import com.highiq.service.QuotaService;
import com.highiq.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 配额控制器
 */
@Slf4j
@RestController
@RequestMapping("/quota")
@CrossOrigin(origins = "*", maxAge = 3600)
public class QuotaController {

    private final QuotaService quotaService;
    private final JwtUtil jwtUtil;

    public QuotaController(QuotaService quotaService, JwtUtil jwtUtil) {
        this.quotaService = quotaService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 获取当前用户配额状态
     */
    @GetMapping("/status")
    public ApiResponse<QuotaStatusDTO> getQuotaStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            QuotaStatusDTO status = quotaService.getQuotaStatus(userId);
            return ApiResponse.success("获取成功", status);
        } catch (Exception e) {
            log.error("Failed to get quota status", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 从 Authorization header 中提取用户ID
     */
    private String extractUserId(String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            throw new RuntimeException("未授权访问");
        }
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(token);
    }
}
