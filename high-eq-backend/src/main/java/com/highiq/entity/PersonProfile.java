package com.highiq.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 人物档案实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("person_profile")
public class PersonProfile {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String userId;

    private String name;

    private String gender;

    private Integer age;

    private String personality;

    private String occupation;

    private String zodiacSign;

    private String chineseZodiac;

    private String hobbies;  // JSON array

    private String relationship;

    private String notes;

    private String avatarUrl;

    private Integer isFavorite;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
