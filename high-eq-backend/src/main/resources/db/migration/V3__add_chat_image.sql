-- 添加聊天截图字段到历史记录表
ALTER TABLE history ADD COLUMN chat_image LONGTEXT COMMENT '聊天截图(Base64或URL)';

-- 添加聊天截图字段到人物档案聊天记录表
ALTER TABLE profile_chat_history ADD COLUMN chat_image LONGTEXT COMMENT '聊天截图(Base64或URL)';
