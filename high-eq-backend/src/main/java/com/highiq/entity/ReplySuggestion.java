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
 * 回复建议实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("reply_suggestion")
public class ReplySuggestion {
    
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    
    private String historyId;
    
    private String suggestionText;
    
    private Integer orderIndex;
    
    private Integer isSelected;
    
    private LocalDateTime createTime;
}
