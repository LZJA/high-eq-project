package com.highiq.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RedemptionRequest {
    @NotBlank(message = "请输入兑换码")
    private String code;
}
