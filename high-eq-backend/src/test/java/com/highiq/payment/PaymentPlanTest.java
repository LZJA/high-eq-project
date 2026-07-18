package com.highiq.payment;

import com.highiq.enums.PaymentPlan;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaymentPlanTest {

    @Test
    void resolvesLiteWithServerOwnedPriceAndDuration() {
        PaymentPlan plan = PaymentPlan.fromTier("lite");

        assertThat(plan.getTier()).isEqualTo("lite");
        assertThat(plan.getAmountCents()).isEqualTo(499);
        assertThat(plan.getDurationMonths()).isEqualTo(1);
    }

    @Test
    void rejectsUnsupportedTier() {
        assertThatThrownBy(() -> PaymentPlan.fromTier("free"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("仅支持 Lite 或 Pro 会员");
    }
}
