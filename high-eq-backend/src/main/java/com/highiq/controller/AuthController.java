package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.LoginRequest;
import com.highiq.dto.LoginResponse;
import com.highiq.dto.RegisterRequest;
import com.highiq.dto.UserDTO;
import com.highiq.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 用户认证控制器
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private final UserService userService;
    
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ApiResponse<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserDTO user = userService.register(request);
            return ApiResponse.success("注册成功", user);
        } catch (Exception e) {
            log.error("Registration failed", e);
            return ApiResponse.error(400, e.getMessage());
        }
    }
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ApiResponse.success("登录成功", response);
        } catch (Exception e) {
            log.error("Login failed", e);
            return ApiResponse.error(401, e.getMessage());
        }
    }
    
    /**
     * 刷新 Token
     */
    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            LoginResponse response = userService.refreshToken(token);
            return ApiResponse.success("Token 刷新成功", response);
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ApiResponse.error(401, e.getMessage());
        }
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            // 这里需要从 token 中提取用户 ID，实际应用中应该使用 Spring Security 的 SecurityContext
            return ApiResponse.success("获取成功", null);
        } catch (Exception e) {
            log.error("Get current user failed", e);
            return ApiResponse.error(401, e.getMessage());
        }
    }
}
