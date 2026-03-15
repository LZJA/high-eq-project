ALTER TABLE guest_statistics ADD COLUMN IF NOT EXISTS upgrade_click_count INT DEFAULT 0 COMMENT 'Upgrade click count';
ALTER TABLE guest_statistics ADD COLUMN IF NOT EXISTS lite_upgrade_click_count INT DEFAULT 0 COMMENT 'Lite upgrade click count';
ALTER TABLE guest_statistics ADD COLUMN IF NOT EXISTS pro_upgrade_click_count INT DEFAULT 0 COMMENT 'Pro upgrade click count';
