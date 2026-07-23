package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.payment.CreatePaymentOrderRequest;
import com.highiq.dto.payment.PaymentOrderDTO;
import com.highiq.service.ManualPaymentService;
import com.highiq.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payment/orders")
public class PaymentController {
    private final ManualPaymentService paymentService;
    private final JwtUtil jwtUtil;

    public PaymentController(ManualPaymentService paymentService, JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ApiResponse<PaymentOrderDTO> create(@RequestHeader("Authorization") String authorization,
                                                 @Valid @RequestBody CreatePaymentOrderRequest request) {
        return ApiResponse.success("订单已创建", paymentService.createOrder(userId(authorization), request));
    }

    @PostMapping("/{orderId}/submit")
    public ApiResponse<PaymentOrderDTO> submit(@RequestHeader("Authorization") String authorization,
                                                @PathVariable String orderId) {
        return ApiResponse.success("已提交，等待人工核账", paymentService.submitOrder(userId(authorization), orderId));
    }

    @GetMapping
    public ApiResponse<List<PaymentOrderDTO>> mine(@RequestHeader("Authorization") String authorization) {
        return ApiResponse.success("获取成功", paymentService.listOrders(userId(authorization)));
    }

    private String userId(String authorization) {
        return jwtUtil.getUserIdFromToken(authorization.replace("Bearer ", ""));
    }
}
