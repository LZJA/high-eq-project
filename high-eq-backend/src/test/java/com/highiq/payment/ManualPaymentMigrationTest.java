package com.highiq.payment;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ManualPaymentMigrationTest {

    @Test
    void definesPaymentOrderAndRedemptionTables() throws IOException {
        try (var input = getClass().getResourceAsStream("/db/migration/V11__create_manual_payment_tables.sql")) {
            assertThat(input).isNotNull();
            String sql = new String(input.readAllBytes(), StandardCharsets.UTF_8);

            assertThat(sql).contains("CREATE TABLE IF NOT EXISTS manual_payment_order");
            assertThat(sql).contains("CREATE TABLE IF NOT EXISTS activation_code");
            assertThat(sql).contains("CREATE TABLE IF NOT EXISTS activation_code_redemption");
            assertThat(sql).contains("UNIQUE KEY uk_manual_payment_order_no");
            assertThat(sql).contains("UNIQUE KEY uk_activation_code_hash");
        }
    }
}
