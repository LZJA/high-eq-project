package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("activation_code")
public class ActivationCode {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String codeHash;
    private String recipientUserId;
    private String tier;
    private Integer durationMonths;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime redeemedTime;
    private String sourceOrderId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
