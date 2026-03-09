package com.highiq.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 升级订阅请求
 */
@Data
public class UpgradeSubscriptionRequest {

    @NotBlank(message = "订阅级别不能为空")
    private String targetTier;

    /**
     * 订阅时长（月），默认 1，范围 1-24
     */
    @Min(value = 1, message = "订阅时长最少为1个月")
    @Max(value = 24, message = "订阅时长最多为24个月")
    private Integer durationMonths = 1;
}
