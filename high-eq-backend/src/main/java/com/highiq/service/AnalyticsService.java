package com.highiq.service;

import com.highiq.dto.UpgradeClickStatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final String CREATE_TABLE_SQL = """
            CREATE TABLE IF NOT EXISTS `upgrade_click` (
                `id` VARCHAR(36) NOT NULL,
                `user_id` VARCHAR(36) NOT NULL,
                `username` VARCHAR(100) NULL,
                `target_tier` VARCHAR(16) NOT NULL,
                `click_time` DATETIME NOT NULL,
                PRIMARY KEY (`id`),
                INDEX `idx_upgrade_click_user_id` (`user_id`),
                INDEX `idx_upgrade_click_target_tier` (`target_tier`),
                INDEX `idx_upgrade_click_time` (`click_time`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """;

    private final JdbcTemplate jdbcTemplate;
    private final AtomicBoolean tableInitialized = new AtomicBoolean(false);

    public void trackUpgradeClick(String userId, String username, String targetTier) {
        ensureTable();
        String normalizedTier = normalizeTier(targetTier);
        jdbcTemplate.update(
                "INSERT INTO upgrade_click (id, user_id, username, target_tier, click_time) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(),
                userId,
                username,
                normalizedTier,
                Timestamp.valueOf(LocalDateTime.now())
        );
    }

    public UpgradeClickStatsDTO getUserClickStats(String userId) {
        ensureTable();
        Long totalCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM upgrade_click WHERE user_id = ?",
                Long.class,
                userId
        );
        Long liteCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM upgrade_click WHERE user_id = ? AND target_tier = 'lite'",
                Long.class,
                userId
        );
        Long proCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM upgrade_click WHERE user_id = ? AND target_tier = 'pro'",
                Long.class,
                userId
        );

        return UpgradeClickStatsDTO.builder()
                .totalCount(totalCount == null ? 0L : totalCount)
                .liteCount(liteCount == null ? 0L : liteCount)
                .proCount(proCount == null ? 0L : proCount)
                .build();
    }

    private void ensureTable() {
        if (tableInitialized.compareAndSet(false, true)) {
            jdbcTemplate.execute(CREATE_TABLE_SQL);
        }
    }

    private String normalizeTier(String targetTier) {
        if (targetTier == null) {
            return "lite";
        }
        String lower = targetTier.toLowerCase(Locale.ROOT);
        return "pro".equals(lower) ? "pro" : "lite";
    }
}
