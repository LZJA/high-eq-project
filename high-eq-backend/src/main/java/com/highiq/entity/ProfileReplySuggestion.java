package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("profile_reply_suggestion")
public class ProfileReplySuggestion {
    private String id;
    private String historyId;
    private String suggestionText;
    private Integer orderIndex;
    private Integer isSelected;
}
