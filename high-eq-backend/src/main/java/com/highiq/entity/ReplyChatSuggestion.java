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
@TableName("reply_chat_suggestion")
public class ReplyChatSuggestion {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String sessionId;
    private String afterMessageId;
    private String content;
    private String reason;
    private String styleLabel;
    private Integer batchIndex;
    private Integer orderIndex;
    private Integer isAdopted;
    private LocalDateTime createTime;
}
