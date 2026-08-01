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
@TableName("reply_chat_session")
public class ReplyChatSession {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String userId;
    private String historyId;
    private String sourceSuggestionId;
    private String roleBackground;
    private String initialChatContent;
    private String initialUserIntent;
    private String modelPreference;
    private String sessionSummary;
    private Integer turnCount;
    private Integer maxTurnCount;
    private Integer warnTurnCount;
    private Integer messageCount;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
