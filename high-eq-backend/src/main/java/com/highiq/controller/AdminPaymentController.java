package com.highiq.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.highiq.dto.ApiResponse;
import com.highiq.entity.ManualPaymentOrder;
import com.highiq.entity.User;
import com.highiq.mapper.ManualPaymentOrderMapper;
import com.highiq.mapper.UserMapper;
import com.highiq.service.ManualPaymentFulfillmentService;
import com.highiq.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/payment-orders")
public class AdminPaymentController {
    private final ManualPaymentOrderMapper orderMapper;
    private final ManualPaymentFulfillmentService fulfillmentService;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public AdminPaymentController(ManualPaymentOrderMapper orderMapper, ManualPaymentFulfillmentService fulfillmentService,
                                  UserMapper userMapper, JwtUtil jwtUtil) {
        this.orderMapper = orderMapper;
        this.fulfillmentService = fulfillmentService;
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ApiResponse<List<ManualPaymentOrder>> list(@RequestHeader("Authorization") String authorization,
                                                       @RequestParam(defaultValue = "SUBMITTED") String status) {
        requireAdmin(authorization);
        return ApiResponse.success("获取成功", orderMapper.selectList(new QueryWrapper<ManualPaymentOrder>()
                .eq("status", status).orderByAsc("submitted_time")));
    }

    @PostMapping("/{orderId}/issue")
    public ApiResponse<Void> issue(@RequestHeader("Authorization") String authorization, @PathVariable String orderId) {
        String adminId = requireAdmin(authorization);
        fulfillmentService.issue(orderId, adminId);
        return ApiResponse.success("兑换码已发送到用户邮箱", null);
    }

    private String requireAdmin(String authorization) {
        String userId = jwtUtil.getUserIdFromToken(authorization.replace("Bearer ", ""));
        User user = userMapper.selectById(userId);
        if (user == null || !"ADMIN".equalsIgnoreCase(user.getRole())) throw new IllegalArgumentException("无权限访问");
        return userId;
    }
}
