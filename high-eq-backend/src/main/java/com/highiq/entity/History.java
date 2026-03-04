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
 * 会话历史实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("history")
public class History {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String userId;

    private String chatContent;

    private String roleBackground;

    private String userIntent;

    private String modelUsed;

    private String tone;  // 语气/风格

    private Integer status;

    private Integer isFavorite;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
