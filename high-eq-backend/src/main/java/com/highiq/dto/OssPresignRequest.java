package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OssPresignRequest {

    @NotBlank(message = "文件名不能为空")
    private String fileName;

    @NotBlank(message = "文件类型不能为空")
    private String contentType;
}
