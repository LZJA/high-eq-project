package com.highiq.service;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class ToneRemovalMigrationTest {

    @Test
    void dropsLegacyToneColumns() throws IOException {
        try (var input = getClass().getResourceAsStream("/db/migration/V18__drop_legacy_tone_columns.sql")) {
            assertThat(input).isNotNull();
            String sql = new String(input.readAllBytes(), StandardCharsets.UTF_8);

            assertThat(sql).contains("ALTER TABLE `history` DROP COLUMN `tone`");
            assertThat(sql).contains("ALTER TABLE `profile_chat_history` DROP COLUMN `tone`");
            assertThat(sql).contains("ALTER TABLE `reply_chat_session` DROP COLUMN `tone`");
            assertThat(sql).contains("ALTER TABLE `reply_chat_suggestion` DROP COLUMN `tone`");
        }
    }
}
