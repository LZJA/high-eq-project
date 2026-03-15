CREATE TABLE IF NOT EXISTS guest_statistics (
    id VARCHAR(36) PRIMARY KEY,
    client_ip VARCHAR(50) NOT NULL COMMENT 'Client IP',
    reply_count INT DEFAULT 0 COMMENT 'Generated reply count',
    upgrade_click_count INT DEFAULT 0 COMMENT 'Upgrade click count',
    lite_upgrade_click_count INT DEFAULT 0 COMMENT 'Lite upgrade click count',
    pro_upgrade_click_count INT DEFAULT 0 COMMENT 'Pro upgrade click count',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_client_ip (client_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Guest statistics';

CREATE TABLE IF NOT EXISTS user_statistics (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL COMMENT 'User ID',
    reply_count INT DEFAULT 0 COMMENT 'Generated reply count',
    profile_reply_count INT DEFAULT 0 COMMENT 'Profile reply count',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User statistics';
