package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 人物档案 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonProfileDTO {

    private String id;

    private String userId;

    private String name;

    private String gender;

    private Integer age;

    private String personality;

    private String occupation;

    private String zodiacSign;

    private String chineseZodiac;

    /**
     * JSON 格式的兴趣爱好数组
     */
    private String hobbies;

    private String relationship;

    private String notes;

    private String avatarUrl;

    private Boolean isFavorite;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
