package com.highiq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReplyChatSessionRequest {
    @NotBlank(message = "历史记录不能为空")
    private String historyId;

    @NotBlank(message = "回复建议不能为空")
    private String suggestionId;

    private String sentReply;
}
