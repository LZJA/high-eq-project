package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("user_statistics")
public class UserStatistics {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String userId;
    private LocalDate date;
    private Integer replyCount;
    private Integer profileReplyCount;
    private Integer upgradeClickCount;
    private Integer liteUpgradeClickCount;
    private Integer proUpgradeClickCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
