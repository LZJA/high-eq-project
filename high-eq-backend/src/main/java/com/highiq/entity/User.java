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

/**
 * 用户实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("user")
public class User {
    
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    
    private String username;
    
    private String password;
    
    private String email;
    
    private String phone;
    
    private String avatarUrl;
    
    private String nickname;
    
    private Integer status;

    // 订阅相关字段
    private String subscriptionTier;      // 订阅级别: free/pro

    private LocalDateTime subscriptionEndTime;  // 订阅结束时间

    // 配额相关字段
    private Integer dailyQuota;           // 每日配额

    private Integer dailyQuotaUsed;       // 今日已使用配额

    private LocalDate quotaResetDate;     // 配额重置日期

    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}
