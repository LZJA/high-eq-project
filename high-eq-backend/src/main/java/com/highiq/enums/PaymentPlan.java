package com.highiq.enums;

/**
 * 服务端定义的可购买会员套餐，避免客户端提交金额。
 */
public enum PaymentPlan {
    LITE("lite", 499, 1),
    PRO("pro", 999, 1);

    private final String tier;
    private final int amountCents;
    private final int durationMonths;

    PaymentPlan(String tier, int amountCents, int durationMonths) {
        this.tier = tier;
        this.amountCents = amountCents;
        this.durationMonths = durationMonths;
    }

    public String getTier() {
        return tier;
    }

    public int getAmountCents() {
        return amountCents;
    }

    public int getDurationMonths() {
        return durationMonths;
    }

    public static PaymentPlan fromTier(String tier) {
        for (PaymentPlan plan : values()) {
            if (plan.tier.equalsIgnoreCase(tier)) {
                return plan;
            }
        }
        throw new IllegalArgumentException("仅支持 Lite 或 Pro 会员");
    }
}
