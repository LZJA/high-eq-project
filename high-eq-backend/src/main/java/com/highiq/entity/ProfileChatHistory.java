package com.highiq.entity;

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
@TableName("profile_chat_history")
public class ProfileChatHistory {
    private String id;
    private String personProfileId;
    private String userId;
    private String chatContent;
    private String roleBackground;
    private String userIntent;
    private String modelUsed;
    private String tone;
    private Integer status;
    private Integer isFavorite;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
