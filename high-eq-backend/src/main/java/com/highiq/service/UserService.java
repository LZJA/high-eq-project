package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.LoginRequest;
import com.highiq.dto.LoginResponse;
import com.highiq.dto.RegisterRequest;
import com.highiq.dto.UserDTO;
import com.highiq.entity.User;
import com.highiq.mapper.UserMapper;
import com.highiq.util.JwtUtil;
import com.highiq.util.PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 用户服务类
 */
@Slf4j
@Service
public class UserService extends ServiceImpl<UserMapper, User> {
    
    private final JwtUtil jwtUtil;
    
    public UserService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * 用户注册
     */
    @Transactional
    public UserDTO register(RegisterRequest request) {
        // 检查用户名是否已存在
        User existingUser = baseMapper.selectByUsername(request.getUsername());
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 检查邮箱是否已存在
        if (request.getEmail() != null) {
            User emailUser = baseMapper.selectByEmail(request.getEmail());
            if (emailUser != null) {
                throw new RuntimeException("邮箱已被注册");
            }
        }
        
        // 检查手机号是否已存在
        if (request.getPhone() != null) {
            User phoneUser = baseMapper.selectByPhone(request.getPhone());
            if (phoneUser != null) {
                throw new RuntimeException("手机号已被注册");
            }
        }
        
        // 创建新用户
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .username(request.getUsername())
                .password(PasswordUtil.encodePassword(request.getPassword()))
                .email(request.getEmail())
                .phone(request.getPhone())
                .status(1)
                .build();
        
        baseMapper.insert(user);
        log.info("User registered successfully: {}", user.getUsername());
        
        return convertToDTO(user);
    }
    
    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        User user = baseMapper.selectByUsername(request.getUsername());
        if (user == null) {
            // 尝试用邮箱查询
            user = baseMapper.selectByEmail(request.getUsername());
        }
        
        if (user == null || user.getStatus() == 0) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 验证密码
        if (!PasswordUtil.matchPassword(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        // 生成 Token
        String token = jwtUtil.generateToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        // 保存当前token，用于互踢
        user.setCurrentToken(token);
        baseMapper.updateById(user);

        log.info("User logged in successfully: {}", user.getUsername());
        
        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(convertToDTO(user))
                .expiresIn(86400L)  // 24 hours
                .build();
    }
    
    /**
     * 根据用户 ID 获取用户信息
     */
    public UserDTO getUserById(String userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return convertToDTO(user);
    }
    
    /**
     * 更新用户信息
     */
    @Transactional
    public UserDTO updateUser(String userId, UserDTO userDTO) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        if (userDTO.getNickname() != null) {
            user.setNickname(userDTO.getNickname());
        }
        if (userDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(userDTO.getAvatarUrl());
        }
        
        baseMapper.updateById(user);
        return convertToDTO(user);
    }
    
    /**
     * 刷新 Token
     */
    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("刷新 Token 无效或已过期");
        }
        
        String userId = jwtUtil.getUserIdFromToken(refreshToken);
        String newToken = jwtUtil.generateToken(userId);
        String newRefreshToken = jwtUtil.generateRefreshToken(userId);
        
        User user = baseMapper.selectById(userId);
        
        return LoginResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .user(convertToDTO(user))
                .expiresIn(86400L)
                .build();
    }
    
    /**
     * 将 User 转换为 UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .nickname(user.getNickname())
                .createTime(user.getCreateTime())
                .build();
    }
}
