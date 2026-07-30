DROP TABLE IF EXISTS user_statistics_v16_normalized;

CREATE TABLE user_statistics_v16_normalized (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT 'User ID',
    reply_count INT NOT NULL DEFAULT 0 COMMENT 'Generated reply count',
    profile_reply_count INT NOT NULL DEFAULT 0 COMMENT 'Profile reply count',
    upgrade_click_count INT NOT NULL DEFAULT 0 COMMENT 'Upgrade click count',
    lite_upgrade_click_count INT NOT NULL DEFAULT 0 COMMENT 'Lite upgrade click count',
    pro_upgrade_click_count INT NOT NULL DEFAULT 0 COMMENT 'Pro upgrade click count',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User statistics';

INSERT INTO user_statistics_v16_normalized (
    id,
    user_id,
    reply_count,
    profile_reply_count,
    upgrade_click_count,
    lite_upgrade_click_count,
    pro_upgrade_click_count,
    create_time,
    update_time
)
SELECT
    MIN(id) AS id,
    user_id,
    COALESCE(SUM(reply_count), 0) AS reply_count,
    COALESCE(SUM(profile_reply_count), 0) AS profile_reply_count,
    COALESCE(SUM(upgrade_click_count), 0) AS upgrade_click_count,
    COALESCE(SUM(lite_upgrade_click_count), 0) AS lite_upgrade_click_count,
    COALESCE(SUM(pro_upgrade_click_count), 0) AS pro_upgrade_click_count,
    COALESCE(MIN(create_time), CURRENT_TIMESTAMP) AS create_time,
    COALESCE(MAX(update_time), CURRENT_TIMESTAMP) AS update_time
FROM user_statistics
GROUP BY user_id;

RENAME TABLE user_statistics TO user_statistics_legacy_v16,
             user_statistics_v16_normalized TO user_statistics;
