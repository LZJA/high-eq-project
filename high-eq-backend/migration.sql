-- 创建人物档案聊天记录表
CREATE TABLE IF NOT EXISTS profile_chat_history (
    id VARCHAR(255) PRIMARY KEY,
    person_profile_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    chat_content TEXT NOT NULL,
    role_background TEXT,
    user_intent TEXT,
    model_used VARCHAR(100),
    tone VARCHAR(50),
    status INT DEFAULT 1,
    is_favorite INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_person_profile_id (person_profile_id),
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建人物档案回复建议表
CREATE TABLE IF NOT EXISTS profile_reply_suggestion (
    id VARCHAR(255) PRIMARY KEY,
    history_id VARCHAR(255) NOT NULL,
    suggestion_text TEXT NOT NULL,
    order_index INT NOT NULL,
    is_selected INT DEFAULT 0,
    INDEX idx_history_id (history_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
