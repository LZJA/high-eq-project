package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyChatSessionListItemDTO {
    private String id;
    private String roleBackground;
    private String initialChatContent;
    private String latestMessage;
    private Integer turnCount;
    private Integer maxTurnCount;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
