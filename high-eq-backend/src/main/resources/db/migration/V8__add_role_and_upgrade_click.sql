ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'USER' COMMENT 'User role: USER/ADMIN';

ALTER TABLE user_statistics ADD COLUMN upgrade_click_count INT DEFAULT 0 COMMENT 'Upgrade click count';
ALTER TABLE user_statistics ADD COLUMN lite_upgrade_click_count INT DEFAULT 0 COMMENT 'Lite upgrade click count';
ALTER TABLE user_statistics ADD COLUMN pro_upgrade_click_count INT DEFAULT 0 COMMENT 'Pro upgrade click count';
