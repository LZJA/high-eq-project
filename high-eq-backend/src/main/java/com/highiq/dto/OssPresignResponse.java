package com.highiq.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OssPresignResponse {

    private String uploadUrl;

    private String publicUrl;

    private String objectKey;

    private String contentType;

    private Long expireAt;
}
