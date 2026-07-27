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
@TableName("reply_chat_message")
public class ReplyChatMessage {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String sessionId;
    private String role;
    private String content;
    private String source;
    private String sourceSuggestionId;
    private Integer turnIndex;
    private LocalDateTime createTime;
}
