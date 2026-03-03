package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 用户登录请求 DTO
 */
@Data
public class LoginRequest {
    
    @NotBlank(message = "用户名或邮箱不能为空")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    private String password;
}
