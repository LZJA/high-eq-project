-- 创建数据库
CREATE DATABASE IF NOT EXISTS high_eq_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE high_eq_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '用户唯一标识符 (UUID)',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
    `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
    `avatar_url` VARCHAR(500) COMMENT '头像 URL',
    `nickname` VARCHAR(100) COMMENT '昵称',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 会话历史表
CREATE TABLE IF NOT EXISTS `history` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '会话唯一标识符 (UUID)',
    `user_id` VARCHAR(36) NOT NULL COMMENT '用户 ID',
    `chat_content` TEXT NOT NULL COMMENT '对方聊天内容',
    `role_background` VARCHAR(100) NOT NULL COMMENT '预设角色背景',
    `user_intent` TEXT NOT NULL COMMENT '用户真实意图',
    `model_used` VARCHAR(50) NOT NULL DEFAULT 'deepseek-chat' COMMENT '使用的 AI 模型名称',
    `tone` VARCHAR(50) DEFAULT '自然得体' COMMENT '语气/风格',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-已删除',
    `is_favorite` TINYINT DEFAULT 0 COMMENT '是否收藏: 1-是, 0-否',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time),
    INDEX idx_is_favorite (is_favorite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话历史表';

-- 回复建议表
CREATE TABLE IF NOT EXISTS `reply_suggestion` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '回复建议唯一标识符 (UUID)',
    `history_id` VARCHAR(36) NOT NULL COMMENT '关联的会话历史 ID',
    `suggestion_text` TEXT NOT NULL COMMENT 'AI 生成的回复建议文本',
    `order_index` INT NOT NULL COMMENT '建议的排序索引',
    `is_selected` TINYINT DEFAULT 0 COMMENT '是否被用户选中: 1-是, 0-否',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (history_id) REFERENCES `history`(id) ON DELETE CASCADE,
    INDEX idx_history_id (history_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回复建议表';

-- 预设角色表
CREATE TABLE IF NOT EXISTS `preset_role` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '角色唯一标识符',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `description` VARCHAR(255) COMMENT '角色描述',
    `is_default` TINYINT DEFAULT 1 COMMENT '是否为预设角色: 1-是, 0-否',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预设角色表';

-- 用户自定义角色表
CREATE TABLE IF NOT EXISTS `custom_role` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '自定义角色唯一标识符',
    `user_id` VARCHAR(36) NOT NULL COMMENT '用户 ID',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `description` VARCHAR(255) COMMENT '角色描述',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_user_role (user_id, role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户自定义角色表';

-- 插入预设角色
INSERT INTO `preset_role` (`id`, `role_name`, `description`) VALUES
('role-001', '同事', '工作中的同事关系'),
('role-002', '朋友', '亲密的朋友关系'),
('role-003', '家人', '家庭成员关系'),
('role-004', '领导', '上级或管理者关系'),
('role-005', '客户', '商业客户关系'),
('role-006', '陌生人', '初次接触的陌生人'),
('role-007', '伴侣', '亲密伴侣关系'),
('role-008', '老师', '教师或导师关系');

-- 创建索引以优化查询性能
CREATE INDEX idx_history_user_create ON `history`(user_id, create_time DESC);
CREATE INDEX idx_reply_history_order ON `reply_suggestion`(history_id, order_index);
