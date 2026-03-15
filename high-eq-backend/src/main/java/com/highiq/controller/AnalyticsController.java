package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.UpgradeClickDTO;
import com.highiq.dto.UpgradeClickStatsDTO;
import com.highiq.service.StatisticsService;
import com.highiq.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final StatisticsService statisticsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/upgrade-click")
    public ApiResponse<Void> trackUpgradeClick(
            @RequestBody UpgradeClickDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request
    ) {
        try {
            if (authHeader != null && !authHeader.isEmpty()) {
                String token = authHeader.replace("Bearer ", "");
                String userId = jwtUtil.getUserIdFromToken(token);
                statisticsService.recordUpgradeClick(userId, dto.getTargetTier());
            } else {
                statisticsService.recordGuestUpgradeClick(getClientIp(request), dto.getTargetTier());
            }
            return ApiResponse.success("记录成功", null);
        } catch (Exception e) {
            log.warn("Failed to record upgrade click", e);
            return ApiResponse.error(500, "记录失败");
        }
    }

    @GetMapping("/upgrade-clicks")
    public ApiResponse<UpgradeClickStatsDTO> getUpgradeClicks(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request
    ) {
        try {
            String userId = null;
            if (authHeader != null && !authHeader.isBlank()) {
                String token = authHeader.replace("Bearer ", "");
                userId = jwtUtil.getUserIdFromToken(token);
            }
            UpgradeClickStatsDTO stats = statisticsService.getUpgradeClickStats(userId, getClientIp(request));
            return ApiResponse.success("获取成功", stats);
        } catch (Exception e) {
            log.warn("Failed to get upgrade clicks", e);
            return ApiResponse.error(500, "获取失败");
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
        return ip != null ? ip.split(",")[0].trim() : "unknown";
    }
}
