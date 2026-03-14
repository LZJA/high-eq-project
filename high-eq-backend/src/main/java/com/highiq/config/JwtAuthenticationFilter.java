package com.highiq.config;

import com.highiq.entity.User;
import com.highiq.mapper.UserMapper;
import com.highiq.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT 认证过滤器 - 验证 JWT Token 并设置用户认证信息
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserMapper userMapper) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // 从请求头中获取 Authorization
            String authHeader = request.getHeader("Authorization");

            // 检查是否是 Bearer Token
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // 去掉 "Bearer " 前缀

                // 验证 Token
                if (jwtUtil.validateToken(token)) {
                    String userId = jwtUtil.getUserIdFromToken(token);

                    // 检查token是否是最新的（互踢逻辑）
                    User user = userMapper.selectById(userId);
                    if (user != null && token.equals(user.getCurrentToken())) {
                        // 创建认证对象
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userId,
                                        null,
                                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                                );

                        // 设置详细信息
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // 将认证信息设置到 SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        log.debug("Set authentication for user: {}", userId);
                    } else {
                        log.warn("Token is not current for user: {}", userId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }
}
