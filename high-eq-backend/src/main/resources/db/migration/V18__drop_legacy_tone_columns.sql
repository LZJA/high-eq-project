ALTER TABLE `history` DROP COLUMN IF EXISTS `tone`;
ALTER TABLE `profile_chat_history` DROP COLUMN IF EXISTS `tone`;
ALTER TABLE `reply_chat_session` DROP COLUMN IF EXISTS `tone`;
ALTER TABLE `reply_chat_suggestion` DROP COLUMN IF EXISTS `tone`;
