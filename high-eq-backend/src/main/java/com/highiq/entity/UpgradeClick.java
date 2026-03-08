package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("upgrade_click")
public class UpgradeClick {
    @TableId(type = IdType.INPUT)
    private String id;
    private String userId;
    private String username;
    private String targetTier;
    private LocalDateTime clickTime;
}
