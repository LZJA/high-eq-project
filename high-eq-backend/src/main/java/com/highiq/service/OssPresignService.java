package com.highiq.service;

import com.aliyun.oss.HttpMethod;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.highiq.dto.OssPresignResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class OssPresignService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    @Value("${aliyun.oss.endpoint:}")
    private String endpoint;

    @Value("${aliyun.oss.bucket-name:}")
    private String bucketName;

    @Value("${aliyun.oss.public-url-base:}")
    private String publicUrlBase;

    @Value("${aliyun.oss.chat-image-prefix:chat-images/}")
    private String chatImagePrefix;

    @Value("${aliyun.oss.access-key-id:}")
    private String accessKeyId;

    @Value("${aliyun.oss.access-key-secret:}")
    private String accessKeySecret;

    @Value("${aliyun.oss.presign-expire-seconds:300}")
    private Long presignExpireSeconds;

    public OssPresignResponse generateUploadUrl(String userId, String fileName, String contentType) {
        validateConfig();
        validateFile(contentType);

        String objectKey = buildObjectKey(userId, fileName, contentType);
        Date expiration = new Date(System.currentTimeMillis() + presignExpireSeconds * 1000);

        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        try {
            GeneratePresignedUrlRequest request =
                    new GeneratePresignedUrlRequest(bucketName, objectKey, HttpMethod.PUT);
            request.setExpiration(expiration);
            request.setContentType(contentType);

            URL uploadUrl = ossClient.generatePresignedUrl(request);
            return OssPresignResponse.builder()
                    .uploadUrl(resolveUploadUrl(uploadUrl))
                    .publicUrl(resolvePublicUrl(objectKey))
                    .objectKey(objectKey)
                    .contentType(contentType)
                    .expireAt(expiration.getTime())
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate OSS presigned URL", e);
            throw new RuntimeException("生成 OSS 上传签名失败: " + e.getMessage(), e);
        } finally {
            ossClient.shutdown();
        }
    }

    private void validateConfig() {
        if (isBlank(endpoint) || isBlank(bucketName) || isBlank(accessKeyId) || isBlank(accessKeySecret)) {
            throw new IllegalStateException("阿里云 OSS 配置不完整，请检查 endpoint、bucket-name、access-key-id、access-key-secret");
        }
    }

    private void validateFile(String contentType) {
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("仅支持 jpeg/png/webp/gif 图片上传");
        }
    }

    private String buildObjectKey(String userId, String fileName, String contentType) {
        String prefix = chatImagePrefix == null ? "chat-images/" : chatImagePrefix.trim();
        if (!prefix.endsWith("/")) {
            prefix += "/";
        }
        String extension = resolveExtension(fileName, contentType);
        String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "");
        return prefix + safeUserId + "/" + System.currentTimeMillis() + "-" + UUID.randomUUID() + "." + extension;
    }

    private String resolveExtension(String fileName, String contentType) {
        int dotIndex = fileName == null ? -1 : fileName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "png";
        };
    }

    private String resolvePublicUrl(String objectKey) {
        if (!isBlank(publicUrlBase)) {
            return trimTrailingSlash(publicUrlBase) + "/" + objectKey;
        }
        return "https://" + bucketName + "." + trimProtocol(endpoint) + "/" + objectKey;
    }

    private String resolveUploadUrl(URL uploadUrl) {
        String scheme = resolvePreferredScheme();
        String value = uploadUrl.toString();
        if ("https".equalsIgnoreCase(scheme) && value.startsWith("http://")) {
            return "https://" + value.substring("http://".length());
        }
        return value;
    }

    private String resolvePreferredScheme() {
        if (!isBlank(publicUrlBase)) {
            return extractScheme(publicUrlBase);
        }
        if (!isBlank(endpoint)) {
            return extractScheme(endpoint);
        }
        return "https";
    }

    private String extractScheme(String value) {
        if (value.startsWith("https://")) {
            return "https";
        }
        if (value.startsWith("http://")) {
            return "http";
        }
        return "https";
    }

    private String trimProtocol(String value) {
        if (value.startsWith("https://")) {
            return value.substring("https://".length());
        }
        if (value.startsWith("http://")) {
            return value.substring("http://".length());
        }
        return value;
    }

    private String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
