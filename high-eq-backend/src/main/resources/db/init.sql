CREATE DATABASE IF NOT EXISTS higheq
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

SET NAMES utf8mb4;

USE higheq;

CREATE TABLE IF NOT EXISTS `user` (
    `id` VARCHAR(36) PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) UNIQUE,
    `phone` VARCHAR(20) UNIQUE,
    `avatar_url` VARCHAR(500),
    `nickname` VARCHAR(100),
    `status` TINYINT NOT NULL DEFAULT 1,
    `subscription_tier` VARCHAR(20) NOT NULL DEFAULT 'free',
    `subscription_end_time` DATETIME NULL,
    `daily_quota` INT NOT NULL DEFAULT 5,
    `daily_quota_used` INT NOT NULL DEFAULT 0,
    `quota_reset_date` DATE NULL,
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_username` (`username`),
    INDEX `idx_user_email` (`email`),
    INDEX `idx_user_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `person_profile` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(20),
    `age` INT,
    `personality` VARCHAR(255),
    `occupation` VARCHAR(100),
    `zodiac_sign` VARCHAR(50),
    `chinese_zodiac` VARCHAR(50),
    `hobbies` TEXT,
    `relationship` VARCHAR(100),
    `notes` TEXT,
    `avatar_url` VARCHAR(500),
    `is_favorite` TINYINT NOT NULL DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 1,
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_person_profile_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_person_profile_user_id` (`user_id`),
    INDEX `idx_person_profile_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `history` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `chat_content` TEXT NOT NULL,
    `role_background` VARCHAR(100) NOT NULL,
    `user_intent` TEXT NOT NULL,
    `model_used` VARCHAR(50) NOT NULL DEFAULT 'deepseek-chat',
    `tone` VARCHAR(50) DEFAULT 'natural',
    `person_profile_id` VARCHAR(36) NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `is_favorite` TINYINT NOT NULL DEFAULT 0,
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_history_person_profile` FOREIGN KEY (`person_profile_id`) REFERENCES `person_profile` (`id`) ON DELETE SET NULL,
    INDEX `idx_history_user_id` (`user_id`),
    INDEX `idx_history_create_time` (`create_time`),
    INDEX `idx_history_is_favorite` (`is_favorite`),
    INDEX `idx_history_person_profile_id` (`person_profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reply_suggestion` (
    `id` VARCHAR(36) PRIMARY KEY,
    `history_id` VARCHAR(36) NOT NULL,
    `suggestion_text` TEXT NOT NULL,
    `order_index` INT NOT NULL,
    `is_selected` TINYINT NOT NULL DEFAULT 0,
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reply_suggestion_history` FOREIGN KEY (`history_id`) REFERENCES `history` (`id`) ON DELETE CASCADE,
    INDEX `idx_reply_suggestion_history_id` (`history_id`),
    INDEX `idx_reply_suggestion_order_index` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profile_chat_history` (
    `id` VARCHAR(36) PRIMARY KEY,
    `person_profile_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `chat_content` TEXT NOT NULL,
    `role_background` VARCHAR(100) NOT NULL,
    `user_intent` TEXT NOT NULL,
    `model_used` VARCHAR(50) NOT NULL DEFAULT 'deepseek-chat',
    `tone` VARCHAR(50) DEFAULT 'natural',
    `status` TINYINT NOT NULL DEFAULT 1,
    `is_favorite` TINYINT NOT NULL DEFAULT 0,
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_profile_chat_history_profile` FOREIGN KEY (`person_profile_id`) REFERENCES `person_profile` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_profile_chat_history_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    INDEX `idx_profile_chat_history_profile_id` (`person_profile_id`),
    INDEX `idx_profile_chat_history_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profile_reply_suggestion` (
    `id` VARCHAR(36) PRIMARY KEY,
    `history_id` VARCHAR(36) NOT NULL,
    `suggestion_text` TEXT NOT NULL,
    `order_index` INT NOT NULL,
    `is_selected` TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_profile_reply_suggestion_history` FOREIGN KEY (`history_id`) REFERENCES `profile_chat_history` (`id`) ON DELETE CASCADE,
    INDEX `idx_profile_reply_suggestion_history_id` (`history_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `preset_role` (
    `id` VARCHAR(36) PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255),
    `is_default` TINYINT NOT NULL DEFAULT 1,
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_preset_role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `preset_role` (`id`, `role_name`, `description`, `is_default`) VALUES
    ('role-001', '同事', '工作场景中的同事关系', 1),
    ('role-002', '朋友', '熟人和朋友之间的交流关系', 1),
    ('role-003', '家人', '家庭成员之间的交流关系', 1),
    ('role-004', '领导', '上下级或管理关系', 1),
    ('role-005', '客户', '商务客户沟通场景', 1),
    ('role-006', '陌生人', '初次接触或不熟悉对象', 1),
    ('role-007', '伴侣', '亲密关系沟通场景', 1),
    ('role-008', '老师', '师生或导师关系', 1)
ON DUPLICATE KEY UPDATE
    `description` = VALUES(`description`),
    `is_default` = VALUES(`is_default`);
