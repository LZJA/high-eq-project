package com.highiq.dto.payment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePaymentOrderRequest {
    @NotBlank(message = "请选择会员套餐")
    private String tier;
    @NotBlank(message = "请填写接收兑换码的邮箱")
    @Email(message = "邮箱格式不正确")
    private String email;
}
