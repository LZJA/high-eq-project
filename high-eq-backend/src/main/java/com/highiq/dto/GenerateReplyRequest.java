package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * AI 回复生成请求 DTO
 */
@Data
public class GenerateReplyRequest {

    private String chatContent;

    private String chatImage;  // 聊天截图 URL

    @NotBlank(message = "角色背景不能为空")
    private String roleBackground;

    @NotBlank(message = "个人意图不能为空")
    private String userIntent;

    private String modelPreference;  // 可选，默认使用 deepseek-v4-flash

    private Integer replyCount;  // 兼容旧客户端；新版本固定生成 5 条

    private String personProfileId;  // 人物档案ID（可选）
}
