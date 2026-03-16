package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsDTO {
    private String id;
    private String userId;
    private String username;
    private String clientIp;
    private String userType;
    private String subscriptionTier;
    private Integer replyCount;
    private Integer profileReplyCount;
    private Integer upgradeClickCount;
    private Integer liteUpgradeClickCount;
    private Integer proUpgradeClickCount;
    private Integer totalCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}