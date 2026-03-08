package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.UpgradeClickDTO;
import com.highiq.dto.UpgradeClickStatsDTO;
import com.highiq.entity.User;
import com.highiq.service.AnalyticsService;
import com.highiq.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    @PostMapping("/upgrade-click")
    public ApiResponse<Void> trackUpgradeClick(
            @RequestBody UpgradeClickDTO dto,
            @AuthenticationPrincipal String userId
    ) {
        String finalUserId = "guest";
        String username = "游客";

        if (userId != null && !userId.isBlank() && !"anonymousUser".equals(userId)) {
            User user = userService.getById(userId);
            if (user != null) {
                finalUserId = user.getId();
                username = user.getUsername();
            }
        }

        try {
            analyticsService.trackUpgradeClick(finalUserId, username, dto.getTargetTier());
        } catch (Exception e) {
            log.warn("Failed to save upgrade click for userId={}", finalUserId, e);
            return ApiResponse.error(500, "埋点记录失败");
        }

        return ApiResponse.success("记录成功", null);
    }

    @GetMapping("/upgrade-clicks")
    public ApiResponse<UpgradeClickStatsDTO> getUpgradeClicks(@AuthenticationPrincipal String userId) {
        String finalUserId = "guest";
        if (userId != null && !userId.isBlank() && !"anonymousUser".equals(userId)) {
            finalUserId = userId;
        }
        UpgradeClickStatsDTO stats = analyticsService.getUserClickStats(finalUserId);
        return ApiResponse.success("获取成功", stats);
    }
}
