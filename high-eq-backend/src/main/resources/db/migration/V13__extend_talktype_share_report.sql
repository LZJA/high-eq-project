ALTER TABLE talktype_share_report
    ADD COLUMN maturity_score INT NULL AFTER communication_code,
    ADD COLUMN dimension_scores_json TEXT NULL AFTER maturity_score,
    ADD COLUMN strengths_json TEXT NULL AFTER identity_insight,
    ADD COLUMN blind_spots_json TEXT NULL AFTER strengths_json,
    ADD COLUMN training_focus_json TEXT NULL AFTER blind_spots_json,
    ADD COLUMN relationship_behavior TEXT NULL AFTER training_focus_json,
    ADD COLUMN workplace_behavior TEXT NULL AFTER relationship_behavior,
    ADD COLUMN friendship_behavior TEXT NULL AFTER workplace_behavior,
    ADD COLUMN snapshot_report_json TEXT NULL AFTER friendship_behavior,
    ADD COLUMN deep_report_json TEXT NULL AFTER snapshot_report_json;
