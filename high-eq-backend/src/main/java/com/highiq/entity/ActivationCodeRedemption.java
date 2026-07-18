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
@TableName("activation_code_redemption")
public class ActivationCodeRedemption {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String activationCodeId;
    private String userId;
    private LocalDateTime redeemedTime;
}
