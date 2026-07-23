package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import com.highiq.service.GuestReplyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/guest/reply")
@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)
public class GuestReplyController {

    private final GuestReplyService guestReplyService;

    public GuestReplyController(GuestReplyService guestReplyService) {
        this.guestReplyService = guestReplyService;
    }

    @PostMapping("/generate")
    public ApiResponse<GenerateReplyResponse> generateReplies(
            @Valid @RequestBody GenerateReplyRequest request,
            HttpServletRequest httpRequest) {
        try {
            String clientKey = getClientKey(httpRequest);
            GenerateReplyResponse response = guestReplyService.generateReplies(clientKey, request);
            return ApiResponse.success("回复生成成功", response);
        } catch (IllegalStateException e) {
            return ApiResponse.error(429, e.getMessage());
        } catch (Exception e) {
            log.error("Failed to generate replies for guest", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/quota")
    public ApiResponse<Integer> getRemainingQuota(HttpServletRequest httpRequest) {
        try {
            String clientKey = getClientKey(httpRequest);
            int remaining = guestReplyService.getRemainingQuota(clientKey);
            return ApiResponse.success("获取成功", remaining);
        } catch (Exception e) {
            log.error("Failed to get quota", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        ip = ip != null ? ip.split(",")[0].trim() : "unknown";
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    private String getClientKey(HttpServletRequest request) {
        String guestId = request.getHeader("X-Guest-Id");
        if (guestId == null || guestId.isBlank()) {
            guestId = "anonymous";
        }
        guestId = guestId.replaceAll("[^a-zA-Z0-9_-]", "");
        if (guestId.length() > 64) {
            guestId = guestId.substring(0, 64);
        }
        return getClientIp(request) + ":" + guestId;
    }
}
