package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.HistoryDTO;
import com.highiq.dto.PersonProfileDTO;
import com.highiq.service.PersonProfileService;
import com.highiq.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 人物档案控制器
 */
@Slf4j
@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PersonProfileController {

    private final PersonProfileService profileService;
    private final JwtUtil jwtUtil;

    public PersonProfileController(PersonProfileService profileService, JwtUtil jwtUtil) {
        this.profileService = profileService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 创建人物档案
     */
    @PostMapping
    public ApiResponse<PersonProfileDTO> createProfile(
            @RequestBody PersonProfileDTO request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            PersonProfileDTO profile = profileService.createProfile(userId, request);
            return ApiResponse.success("创建成功", profile);
        } catch (Exception e) {
            log.error("Failed to create profile", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 获取用户的所有人物档案
     */
    @GetMapping
    public ApiResponse<List<PersonProfileDTO>> getProfiles(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            List<PersonProfileDTO> profiles = profileService.getUserProfiles(userId);
            return ApiResponse.success("获取成功", profiles);
        } catch (Exception e) {
            log.error("Failed to get profiles", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 获取人物档案详情
     */
    @GetMapping("/{profileId}")
    public ApiResponse<PersonProfileDTO> getProfile(
            @PathVariable String profileId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            PersonProfileDTO profile = profileService.getProfileDetail(profileId, userId);
            return ApiResponse.success("获取成功", profile);
        } catch (Exception e) {
            log.error("Failed to get profile", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 更新人物档案
     */
    @PutMapping("/{profileId}")
    public ApiResponse<PersonProfileDTO> updateProfile(
            @PathVariable String profileId,
            @RequestBody PersonProfileDTO request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            PersonProfileDTO profile = profileService.updateProfile(profileId, userId, request);
            return ApiResponse.success("更新成功", profile);
        } catch (Exception e) {
            log.error("Failed to update profile", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 删除人物档案
     */
    @DeleteMapping("/{profileId}")
    public ApiResponse<Void> deleteProfile(
            @PathVariable String profileId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            profileService.deleteProfile(profileId, userId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            log.error("Failed to delete profile", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 收藏/取消收藏人物档案
     */
    @PostMapping("/{profileId}/favorite")
    public ApiResponse<Void> toggleFavorite(
            @PathVariable String profileId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            profileService.toggleFavorite(profileId, userId);
            return ApiResponse.success("操作成功", null);
        } catch (Exception e) {
            log.error("Failed to toggle favorite", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 获取与人物的聊天历史
     */
    @GetMapping("/{profileId}/history")
    public ApiResponse<List<HistoryDTO>> getProfileHistory(
            @PathVariable String profileId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            List<HistoryDTO> history = profileService.getProfileHistory(profileId, userId);
            return ApiResponse.success("获取成功", history);
        } catch (Exception e) {
            log.error("Failed to get profile history", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 获取人物档案聊天历史详情
     */
    @GetMapping("/{profileId}/history/{historyId}")
    public ApiResponse<HistoryDTO> getProfileHistoryDetail(
            @PathVariable String profileId,
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            HistoryDTO history = profileService.getProfileHistoryDetail(profileId, historyId, userId);
            return ApiResponse.success("获取成功", history);
        } catch (Exception e) {
            log.error("Failed to get profile history detail", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 收藏/取消收藏人物档案聊天历史
     */
    @PostMapping("/{profileId}/history/{historyId}/favorite")
    public ApiResponse<Void> toggleProfileHistoryFavorite(
            @PathVariable String profileId,
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            profileService.toggleHistoryFavorite(profileId, historyId, userId);
            return ApiResponse.success("操作成功", null);
        } catch (Exception e) {
            log.error("Failed to toggle profile history favorite", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @DeleteMapping("/{profileId}/history/{historyId}")
    public ApiResponse<Void> deleteProfileHistory(
            @PathVariable String profileId,
            @PathVariable String historyId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            profileService.deleteProfileHistory(profileId, historyId, userId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            log.error("Failed to delete profile history", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    /**
     * 从 Authorization header 中提取用户ID
     */
    private String extractUserId(String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            throw new RuntimeException("未授权访问");
        }
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(token);
    }
}
