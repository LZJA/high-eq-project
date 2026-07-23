package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("talktype_share_report")
public class TalkTypeShareReport {
    @TableId(type = IdType.ASSIGN_UUID)
    private String id;
    private String shareId;
    private String personalityId;
    private String personalityName;
    private String codeName;
    private String communicationCode;
    private Integer maturityScore;
    private String dimensionScoresJson;
    private String tagline;
    private String summary;
    private String shareText;
    private String imagePath;
    private String primaryColor;
    private String secondaryColor;
    private String tagsJson;
    private String identityInsight;
    private String strengthsJson;
    private String blindSpotsJson;
    private String trainingFocusJson;
    private String relationshipBehavior;
    private String workplaceBehavior;
    private String friendshipBehavior;
    private String snapshotReportJson;
    private String deepReportJson;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
