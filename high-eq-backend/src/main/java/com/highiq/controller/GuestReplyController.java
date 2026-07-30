package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import com.highiq.service.GuestReplyService;
import com.highiq.util.GuestClientKeyUtil;
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
            String clientKey = GuestClientKeyUtil.getClientKey(httpRequest);
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
            String clientKey = GuestClientKeyUtil.getClientKey(httpRequest);
            int remaining = guestReplyService.getRemainingQuota(clientKey);
            return ApiResponse.success("获取成功", remaining);
        } catch (Exception e) {
            log.error("Failed to get quota", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

}
