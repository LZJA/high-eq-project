CREATE TABLE IF NOT EXISTS manual_payment_order (
    id VARCHAR(36) PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    amount_cents INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_time DATETIME NULL,
    issued_time DATETIME NULL,
    mailed_time DATETIME NULL,
    reviewer_id VARCHAR(36) NULL,
    internal_note VARCHAR(500) NULL,
    activation_code_id VARCHAR(36) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_manual_payment_order_no (order_no),
    KEY idx_manual_payment_user_status (user_id, status),
    KEY idx_manual_payment_status_time (status, submitted_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Manual payment orders';

CREATE TABLE IF NOT EXISTS activation_code (
    id VARCHAR(36) PRIMARY KEY,
    code_hash CHAR(64) NOT NULL,
    recipient_user_id VARCHAR(36) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    duration_months INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at DATETIME NULL,
    redeemed_time DATETIME NULL,
    source_order_id VARCHAR(36) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_activation_code_hash (code_hash),
    UNIQUE KEY uk_activation_code_order (source_order_id),
    KEY idx_activation_code_recipient (recipient_user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Single-use membership activation codes';

CREATE TABLE IF NOT EXISTS activation_code_redemption (
    id VARCHAR(36) PRIMARY KEY,
    activation_code_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    redeemed_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_activation_code_redemption (activation_code_id),
    UNIQUE KEY uk_activation_code_user (activation_code_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Activation code redemption audit';
