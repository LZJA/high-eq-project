package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 预设角色实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("preset_role")
public class PresetRole {
    
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    
    private String roleName;
    
    private String description;
    
    private Integer isDefault;
    
    private LocalDateTime createTime;
}
