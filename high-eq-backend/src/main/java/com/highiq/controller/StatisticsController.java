package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.PagedStatisticsDTO;
import com.highiq.dto.StatisticsOverviewDTO;
import com.highiq.dto.UserStatisticsDTO;
import com.highiq.entity.User;
import com.highiq.mapper.UserMapper;
import com.highiq.service.StatisticsService;
import com.highiq.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/statistics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public StatisticsController(StatisticsService statisticsService, JwtUtil jwtUtil, UserMapper userMapper) {
        this.statisticsService = statisticsService;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @GetMapping("/all")
    public ApiResponse<PagedStatisticsDTO> getAllStatistics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false, defaultValue = "ALL") String userType,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            User user = userMapper.selectById(userId);

            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ApiResponse.error(403, "无权限访问");
            }

            PagedStatisticsDTO stats = statisticsService.getAllStatistics(userType, page, pageSize);
            return ApiResponse.success("获取成功", stats);
        } catch (Exception e) {
            log.error("Failed to get statistics", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/overview")
    public ApiResponse<StatisticsOverviewDTO> getOverview(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            User user = userMapper.selectById(userId);

            if (user == null || !"ADMIN".equals(user.getRole())) {
                return ApiResponse.error(403, "无权限访问");
            }

            StatisticsOverviewDTO overview = statisticsService.getOverview();
            return ApiResponse.success("获取成功", overview);
        } catch (Exception e) {
            log.error("Failed to get overview", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
