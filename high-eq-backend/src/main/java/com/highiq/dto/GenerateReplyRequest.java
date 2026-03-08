package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * AI 回复生成请求 DTO
 */
@Data
public class GenerateReplyRequest {

    @NotBlank(message = "聊天内容不能为空")
    private String chatContent;

    @NotBlank(message = "角色背景不能为空")
    private String roleBackground;

    @NotBlank(message = "个人意图不能为空")
    private String userIntent;

    private String modelPreference;  // 可选，默认使用 deepseek-chat

    private Integer replyCount;  // 生成回复的数量，默认 3

    private String tone;  // 语气/风格：温和友善、正式得体、幽默风趣、真诚直接、委婉含蓄

    private String personProfileId;  // 人物档案ID（可选）
}
