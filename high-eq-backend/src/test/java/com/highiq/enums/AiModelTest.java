package com.highiq.enums;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiModelTest {

    @Test
    void returnsPointCostForEachSupportedModel() {
        assertThat(AiModel.pointCostOf("deepseek-v4-flash")).isEqualTo(1);
        assertThat(AiModel.pointCostOf("deepseek-v4-pro")).isEqualTo(3);
        assertThat(AiModel.pointCostOf("qwen3-vl-plus")).isEqualTo(3);
        assertThat(AiModel.pointCostOf("doubao-seed-2.0-pro")).isEqualTo(8);
    }

    @Test
    void defaultsUnknownModelToBasicCost() {
        assertThat(AiModel.pointCostOf(null)).isEqualTo(1);
        assertThat(AiModel.pointCostOf("unknown-model")).isEqualTo(1);
    }

    @Test
    void exposesCurrentSubscriptionPointBudgets() {
        assertThat(SubscriptionTier.FREE.getDailyQuota()).isEqualTo(10);
        assertThat(SubscriptionTier.LITE.getDailyQuota()).isEqualTo(60);
        assertThat(SubscriptionTier.PRO.getDailyQuota()).isEqualTo(150);
    }

    @Test
    void exposesCurrentModelAvailabilityByTier() {
        assertThat(SubscriptionTier.FREE.isModelAllowed("deepseek-v4-flash")).isTrue();
        assertThat(SubscriptionTier.FREE.isModelAllowed("deepseek-v4-pro")).isFalse();

        assertThat(SubscriptionTier.LITE.isModelAllowed("deepseek-v4-pro")).isTrue();
        assertThat(SubscriptionTier.LITE.isModelAllowed("qwen3-vl-plus")).isTrue();
        assertThat(SubscriptionTier.LITE.isModelAllowed("doubao-seed-2.0-pro")).isFalse();

        assertThat(SubscriptionTier.PRO.isModelAllowed("doubao-seed-2.0-pro")).isTrue();
    }
}
