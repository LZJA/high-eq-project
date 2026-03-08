package com.highiq.enums;

import lombok.Getter;

/**
 * 订阅级别枚举
 */
@Getter
public enum SubscriptionTier {
    FREE("free", 5, new String[]{"deepseek-chat"}),
    LITE("lite", 50, new String[]{"deepseek-chat", "gpt-4"}),
    PRO("pro", -1, new String[]{"deepseek-chat", "gpt-4", "gpt-4-turbo", "claude-3"});

    private final String code;
    private final int dailyQuota;  // -1 表示无限制
    private final String[] allowedModels;

    SubscriptionTier(String code, int dailyQuota, String[] allowedModels) {
        this.code = code;
        this.dailyQuota = dailyQuota;
        this.allowedModels = allowedModels;
    }

    /**
     * 根据代码获取订阅级别
     */
    public static SubscriptionTier fromCode(String code) {
        if (code == null) {
            return FREE;
        }
        for (SubscriptionTier tier : values()) {
            if (tier.getCode().equalsIgnoreCase(code)) {
                return tier;
            }
        }
        return FREE;
    }

    /**
     * 检查模型是否可用
     */
    public boolean isModelAllowed(String model) {
        if (model == null) {
            return true;
        }
        for (String allowed : allowedModels) {
            if (allowed.equalsIgnoreCase(model)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否无限制
     */
    public boolean isUnlimited() {
        return dailyQuota == -1;
    }
}
