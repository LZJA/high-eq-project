package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.OssPresignRequest;
import com.highiq.dto.OssPresignResponse;
import com.highiq.service.OssPresignService;
import com.highiq.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/oss")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OssController {

    private final OssPresignService ossPresignService;
    private final JwtUtil jwtUtil;

    public OssController(OssPresignService ossPresignService, JwtUtil jwtUtil) {
        this.ossPresignService = ossPresignService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/presign")
    public ApiResponse<OssPresignResponse> getPresignedUploadUrl(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody OssPresignRequest request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.getUserIdFromToken(token);
            return ApiResponse.success(
                    "获取 OSS 上传签名成功",
                    ossPresignService.generateUploadUrl(userId, request.getFileName(), request.getContentType())
            );
        } catch (Exception e) {
            log.error("Failed to get OSS presigned upload URL", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
