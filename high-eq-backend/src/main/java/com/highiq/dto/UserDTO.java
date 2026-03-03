package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 用户信息 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private String id;
    
    private String username;
    
    private String email;
    
    private String phone;
    
    private String avatarUrl;
    
    private String nickname;
    
    private LocalDateTime createTime;
}
