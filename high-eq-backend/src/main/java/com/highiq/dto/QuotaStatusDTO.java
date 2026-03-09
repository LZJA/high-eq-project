package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 配额状态 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaStatusDTO {

    /**
     * 订阅级别
     */
    private String tier;

    /**
     * 每日配额总数
     */
    private Integer dailyQuota;

    /**
     * 今日已使用配额
     */
    private Integer dailyQuotaUsed;

    /**
     * 剩余配额
     */
    private Integer remainingQuota;

    /**
     * 是否无限制
     */
    private Boolean isUnlimited;

    /**
     * 配额重置日期
     */
    private LocalDate resetDate;

    /**
     * 可用的模型列表
     */
    private String[] availableModels;

    /**
     * 订阅到期时间（免费版为 null）
     */
    private LocalDateTime subscriptionEndTime;

    /**
     * 订阅剩余秒数（免费版为 null）
     */
    private Long subscriptionRemainingSeconds;

    /**
     * 当前订阅是否已过期
     */
    private Boolean subscriptionExpired;
}
