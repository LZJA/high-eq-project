ALTER TABLE reply_suggestion
  ADD COLUMN style_label VARCHAR(32) NULL COMMENT '回复风格标签' AFTER suggestion_text;

ALTER TABLE profile_reply_suggestion
  ADD COLUMN style_label VARCHAR(32) NULL COMMENT '回复风格标签' AFTER suggestion_text;

CREATE TABLE reply_chat_session (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  history_id VARCHAR(64) NOT NULL,
  source_suggestion_id VARCHAR(64) NOT NULL,
  role_background VARCHAR(500) NULL,
  initial_chat_content TEXT NULL,
  initial_user_intent TEXT NULL,
  tone VARCHAR(50) NULL COMMENT 'legacy display tone; new generation no longer exposes tone selection',
  model_preference VARCHAR(50) NULL,
  session_summary TEXT NULL,
  turn_count INT NOT NULL DEFAULT 0,
  max_turn_count INT NOT NULL DEFAULT 12,
  warn_turn_count INT NOT NULL DEFAULT 9,
  message_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reply_chat_session_user (user_id),
  INDEX idx_reply_chat_session_history (history_id),
  INDEX idx_reply_chat_session_updated (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复续聊会话';

CREATE TABLE reply_chat_message (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  role VARCHAR(20) NOT NULL COMMENT 'opponent/user',
  content TEXT NOT NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'manual' COMMENT 'initial/manual/ai_adopted',
  source_suggestion_id VARCHAR(64) NULL,
  turn_index INT NOT NULL DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reply_chat_message_session (session_id),
  INDEX idx_reply_chat_message_turn (session_id, turn_index, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复续聊消息';

CREATE TABLE reply_chat_suggestion (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL,
  after_message_id VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  reason TEXT NULL,
  tone VARCHAR(50) NULL COMMENT 'legacy display tone; new generation no longer exposes tone selection',
  style_label VARCHAR(32) NULL,
  batch_index INT NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 1,
  is_adopted TINYINT NOT NULL DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reply_chat_suggestion_session (session_id),
  INDEX idx_reply_chat_suggestion_after_message (after_message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复续聊候选建议';
