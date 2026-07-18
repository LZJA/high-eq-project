package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.QuotaStatusDTO;
import com.highiq.dto.payment.RedemptionRequest;
import com.highiq.service.ActivationCodeService;
import com.highiq.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/redemption")
public class RedemptionController {
    private final ActivationCodeService activationCodeService;
    private final JwtUtil jwtUtil;

    public RedemptionController(ActivationCodeService activationCodeService, JwtUtil jwtUtil) {
        this.activationCodeService = activationCodeService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/redeem")
    public ApiResponse<QuotaStatusDTO> redeem(@RequestHeader("Authorization") String authorization,
                                                @Valid @RequestBody RedemptionRequest request) {
        String userId = jwtUtil.getUserIdFromToken(authorization.replace("Bearer ", ""));
        return ApiResponse.success("兑换成功", activationCodeService.redeem(userId, request.getCode()));
    }
}
