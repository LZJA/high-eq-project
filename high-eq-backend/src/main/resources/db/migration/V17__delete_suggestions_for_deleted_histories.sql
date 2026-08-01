DELETE rs
FROM `reply_suggestion` rs
JOIN `history` h ON h.`id` = rs.`history_id`
WHERE h.`status` = 0;

DELETE prs
FROM `profile_reply_suggestion` prs
JOIN `profile_chat_history` pch ON pch.`id` = prs.`history_id`
WHERE pch.`status` = 0;
