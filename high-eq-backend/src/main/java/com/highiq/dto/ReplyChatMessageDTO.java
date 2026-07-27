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
public class ReplyChatMessageDTO {
    private String id;
    private String role;
    private String content;
    private String source;
    private Integer turnIndex;
    private LocalDateTime createTime;
}
