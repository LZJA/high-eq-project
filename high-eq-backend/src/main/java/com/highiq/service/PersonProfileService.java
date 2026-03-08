package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.HistoryDTO;
import com.highiq.dto.PageResponse;
import com.highiq.dto.PersonProfileDTO;
import com.highiq.entity.History;
import com.highiq.entity.PersonProfile;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.PersonProfileMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 人物档案服务
 */
@Slf4j
@Service
public class PersonProfileService extends ServiceImpl<PersonProfileMapper, PersonProfile> {

    private final HistoryMapper historyMapper;

    public PersonProfileService(HistoryMapper historyMapper) {
        this.historyMapper = historyMapper;
    }

    /**
     * 创建人物档案
     */
    @Transactional
    public PersonProfileDTO createProfile(String userId, PersonProfileDTO request) {
        PersonProfile profile = PersonProfile.builder()
                .userId(userId)
                .name(request.getName())
                .gender(request.getGender())
                .age(request.getAge())
                .personality(request.getPersonality())
                .occupation(request.getOccupation())
                .zodiacSign(request.getZodiacSign())
                .chineseZodiac(request.getChineseZodiac())
                .hobbies(request.getHobbies())
                .relationship(request.getRelationship())
                .notes(request.getNotes())
                .avatarUrl(request.getAvatarUrl())
                .isFavorite(0)
                .status(1)
                .build();

        baseMapper.insert(profile);
        log.info("Created person profile: {} for user: {}", profile.getId(), userId);
        return convertToDTO(profile);
    }

    /**
     * 获取用户的所有人物档案
     */
    public List<PersonProfileDTO> getUserProfiles(String userId) {
        QueryWrapper<PersonProfile> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
                .eq("status", 1)
                .orderByDesc("create_time");

        return baseMapper.selectList(wrapper).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取人物档案详情
     */
    public PersonProfileDTO getProfileDetail(String profileId, String userId) {
        PersonProfile profile = baseMapper.selectById(profileId);
        if (profile == null || !profile.getUserId().equals(userId) || profile.getStatus() != 1) {
            throw new RuntimeException("人物档案不存在");
        }
        return convertToDTO(profile);
    }

    /**
     * 更新人物档案
     */
    @Transactional
    public PersonProfileDTO updateProfile(String profileId, String userId, PersonProfileDTO request) {
        PersonProfile profile = baseMapper.selectById(profileId);
        if (profile == null || !profile.getUserId().equals(userId)) {
            throw new RuntimeException("人物档案不存在");
        }

        if (request.getName() != null) profile.setName(request.getName());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getAge() != null) profile.setAge(request.getAge());
        if (request.getPersonality() != null) profile.setPersonality(request.getPersonality());
        if (request.getOccupation() != null) profile.setOccupation(request.getOccupation());
        if (request.getZodiacSign() != null) profile.setZodiacSign(request.getZodiacSign());
        if (request.getChineseZodiac() != null) profile.setChineseZodiac(request.getChineseZodiac());
        if (request.getHobbies() != null) profile.setHobbies(request.getHobbies());
        if (request.getRelationship() != null) profile.setRelationship(request.getRelationship());
        if (request.getNotes() != null) profile.setNotes(request.getNotes());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());

        baseMapper.updateById(profile);
        log.info("Updated person profile: {}", profileId);
        return convertToDTO(profile);
    }

    /**
     * 删除人物档案（软删除）
     */
    @Transactional
    public void deleteProfile(String profileId, String userId) {
        PersonProfile profile = baseMapper.selectById(profileId);
        if (profile == null || !profile.getUserId().equals(userId)) {
            throw new RuntimeException("人物档案不存在");
        }
        profile.setStatus(0);
        baseMapper.updateById(profile);

        // 级联删除该档案的所有历史记录
        QueryWrapper<History> historyWrapper = new QueryWrapper<>();
        historyWrapper.eq("person_profile_id", profileId);
        List<History> histories = historyMapper.selectList(historyWrapper);
        for (History history : histories) {
            history.setStatus(0);
            historyMapper.updateById(history);
        }

        log.info("Deleted person profile: {} and {} related histories", profileId, histories.size());
    }

    /**
     * 收藏/取消收藏人物档案
     */
    @Transactional
    public void toggleFavorite(String profileId, String userId) {
        PersonProfile profile = baseMapper.selectById(profileId);
        if (profile == null || !profile.getUserId().equals(userId)) {
            throw new RuntimeException("人物档案不存在");
        }
        profile.setIsFavorite(profile.getIsFavorite() == 0 ? 1 : 0);
        baseMapper.updateById(profile);
    }

    /**
     * 获取与人物的聊天历史
     */
    public List<HistoryDTO> getProfileHistory(String profileId, String userId) {
        // 验证人物档案属于该用户
        PersonProfile profile = baseMapper.selectById(profileId);
        if (profile == null || !profile.getUserId().equals(userId)) {
            throw new RuntimeException("人物档案不存在");
        }

        QueryWrapper<History> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
                .eq("person_profile_id", profileId)
                .eq("status", 1)
                .orderByDesc("create_time");

        List<History> histories = historyMapper.selectList(wrapper);
        return histories.stream()
                .map(h -> convertHistoryToDTO(h))
                .collect(Collectors.toList());
    }

    /**
     * 转换为 DTO
     */
    private PersonProfileDTO convertToDTO(PersonProfile profile) {
        return PersonProfileDTO.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .name(profile.getName())
                .gender(profile.getGender())
                .age(profile.getAge())
                .personality(profile.getPersonality())
                .occupation(profile.getOccupation())
                .zodiacSign(profile.getZodiacSign())
                .chineseZodiac(profile.getChineseZodiac())
                .hobbies(profile.getHobbies())
                .relationship(profile.getRelationship())
                .notes(profile.getNotes())
                .avatarUrl(profile.getAvatarUrl())
                .isFavorite(profile.getIsFavorite() != null && profile.getIsFavorite() == 1)
                .createTime(profile.getCreateTime())
                .updateTime(profile.getUpdateTime())
                .build();
    }

    /**
     * 转换 History 为 DTO（简化版，不含建议列表）
     */
    private HistoryDTO convertHistoryToDTO(History history) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return HistoryDTO.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .chatContent(history.getChatContent())
                .roleBackground(history.getRoleBackground())
                .userIntent(history.getUserIntent())
                .modelUsed(history.getModelUsed())
                .tone(history.getTone())
                .isFavorite(history.getIsFavorite() != null && history.getIsFavorite() == 1)
                .createTime(history.getCreateTime() != null ? history.getCreateTime().format(formatter) : null)
                .suggestions(null)
                .build();
    }
}
