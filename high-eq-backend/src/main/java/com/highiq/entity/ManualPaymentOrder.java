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
@TableName("manual_payment_order")
public class ManualPaymentOrder {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String orderNo;
    private String userId;
    private String email;
    private String tier;
    private Integer amountCents;
    private String status;
    private LocalDateTime submittedTime;
    private LocalDateTime issuedTime;
    private LocalDateTime mailedTime;
    private String reviewerId;
    private String internalNote;
    private String activationCodeId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
