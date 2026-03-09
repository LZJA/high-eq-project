package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.HistoryDTO;
import com.highiq.dto.PageResponse;
import com.highiq.dto.PersonProfileDTO;
import com.highiq.dto.SuggestionDTO;
import com.highiq.entity.PersonProfile;
import com.highiq.entity.ProfileChatHistory;
import com.highiq.entity.ProfileReplySuggestion;
import com.highiq.entity.User;
import com.highiq.enums.SubscriptionTier;
import com.highiq.exception.ProfileLimitExceededException;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.PersonProfileMapper;
import com.highiq.mapper.ProfileChatHistoryMapper;
import com.highiq.mapper.ProfileReplySuggestionMapper;
import com.highiq.mapper.UserMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PersonProfileService extends ServiceImpl<PersonProfileMapper, PersonProfile> {

    private static final DateTimeFormatter HISTORY_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @SuppressWarnings("unused")
    private final HistoryMapper historyMapper;
    private final UserMapper userMapper;
    private final ProfileChatHistoryMapper profileChatHistoryMapper;
    private final ProfileReplySuggestionMapper profileReplySuggestionMapper;

    public PersonProfileService(
            HistoryMapper historyMapper,
            UserMapper userMapper,
            ProfileChatHistoryMapper profileChatHistoryMapper,
            ProfileReplySuggestionMapper profileReplySuggestionMapper) {
        this.historyMapper = historyMapper;
        this.userMapper = userMapper;
        this.profileChatHistoryMapper = profileChatHistoryMapper;
        this.profileReplySuggestionMapper = profileReplySuggestionMapper;
    }

    @Transactional
    public PersonProfileDTO createProfile(String userId, PersonProfileDTO request) {
        validateProfileCreationLimit(userId);

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

    private void validateProfileCreationLimit(String userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());
        int maxProfiles = switch (tier) {
            case FREE -> 1;
            case LITE -> 10;
            case PRO -> -1;
        };

        if (maxProfiles == -1) {
            return;
        }

        QueryWrapper<PersonProfile> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("status", 1);
        Long profileCount = baseMapper.selectCount(wrapper);
        if (profileCount != null && profileCount >= maxProfiles) {
            String message = switch (tier) {
                case FREE -> "免费版最多只能创建1个人物档案，请升级到Lite或PRO";
                case LITE -> "Lite版最多只能创建10个人物档案，请升级到PRO";
                case PRO -> "人物档案数量已达上限";
            };
            throw new ProfileLimitExceededException(message);
        }
    }

    public List<PersonProfileDTO> getUserProfiles(String userId) {
        QueryWrapper<PersonProfile> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
                .eq("status", 1)
                .orderByDesc("create_time");

        return baseMapper.selectList(wrapper).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PersonProfileDTO getProfileDetail(String profileId, String userId) {
        PersonProfile profile = requireProfile(profileId, userId);
        if (profile.getStatus() != 1) {
            throw new RuntimeException("人物档案不存在");
        }
        return convertToDTO(profile);
    }

    @Transactional
    public PersonProfileDTO updateProfile(String profileId, String userId, PersonProfileDTO request) {
        PersonProfile profile = requireProfile(profileId, userId);

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

    @Transactional
    public void deleteProfile(String profileId, String userId) {
        PersonProfile profile = requireProfile(profileId, userId);
        profile.setStatus(0);
        baseMapper.updateById(profile);

        QueryWrapper<ProfileChatHistory> historyWrapper = new QueryWrapper<>();
        historyWrapper.eq("person_profile_id", profileId);
        List<ProfileChatHistory> histories = profileChatHistoryMapper.selectList(historyWrapper);
        for (ProfileChatHistory history : histories) {
            history.setStatus(0);
            profileChatHistoryMapper.updateById(history);
        }

        log.info("Deleted person profile: {} and {} related histories", profileId, histories.size());
    }

    @Transactional
    public void toggleFavorite(String profileId, String userId) {
        PersonProfile profile = requireProfile(profileId, userId);
        profile.setIsFavorite(profile.getIsFavorite() == 0 ? 1 : 0);
        baseMapper.updateById(profile);
    }

    public PageResponse<HistoryDTO> getProfileHistory(String profileId, String userId, Integer page, Integer size) {
        requireProfile(profileId, userId);

        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;

        QueryWrapper<ProfileChatHistory> countWrapper = new QueryWrapper<>();
        countWrapper.eq("user_id", userId)
                .eq("person_profile_id", profileId)
                .eq("status", 1);
        Long total = profileChatHistoryMapper.selectCount(countWrapper);

        int offset = (page - 1) * size;
        QueryWrapper<ProfileChatHistory> dataWrapper = new QueryWrapper<>();
        dataWrapper.eq("user_id", userId)
                .eq("person_profile_id", profileId)
                .eq("status", 1)
                .orderByDesc("create_time")
                .last("LIMIT " + offset + ", " + size);

        List<HistoryDTO> items = profileChatHistoryMapper.selectList(dataWrapper).stream()
                .map(history -> convertProfileHistoryToDTO(history, false))
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) total / size);
        return PageResponse.<HistoryDTO>builder()
                .items(items)
                .totalPages(totalPages)
                .total(total)
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    public HistoryDTO getProfileHistoryDetail(String profileId, String historyId, String userId) {
        requireProfile(profileId, userId);
        return convertProfileHistoryToDTO(requireProfileHistory(profileId, historyId, userId), true);
    }

    @Transactional
    public void toggleHistoryFavorite(String profileId, String historyId, String userId) {
        requireProfile(profileId, userId);

        ProfileChatHistory history = requireProfileHistory(profileId, historyId, userId);
        history.setIsFavorite(history.getIsFavorite() != null && history.getIsFavorite() == 1 ? 0 : 1);
        profileChatHistoryMapper.updateById(history);
    }

    @Transactional
    public void deleteProfileHistory(String profileId, String historyId, String userId) {
        requireProfile(profileId, userId);

        ProfileChatHistory history = requireProfileHistory(profileId, historyId, userId);
        history.setStatus(0);
        profileChatHistoryMapper.updateById(history);
    }

    public List<HistoryDTO> getFavoriteProfileHistory(String userId) {
        QueryWrapper<ProfileChatHistory> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
                .eq("status", 1)
                .eq("is_favorite", 1)
                .orderByDesc("create_time");

        return profileChatHistoryMapper.selectList(wrapper).stream()
                .map(history -> convertProfileHistoryToDTO(history, true))
                .collect(Collectors.toList());
    }

    private PersonProfile requireProfile(String profileId, String userId) {
        PersonProfile profile = baseMapper.selectById(profileId);
        if (profile == null || !profile.getUserId().equals(userId)) {
            throw new RuntimeException("人物档案不存在");
        }
        return profile;
    }

    private ProfileChatHistory requireProfileHistory(String profileId, String historyId, String userId) {
        ProfileChatHistory history = profileChatHistoryMapper.selectById(historyId);
        if (history == null
                || !history.getUserId().equals(userId)
                || !history.getPersonProfileId().equals(profileId)
                || history.getStatus() != 1) {
            throw new RuntimeException("聊天历史不存在");
        }
        return history;
    }

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

    private HistoryDTO convertProfileHistoryToDTO(ProfileChatHistory history, boolean includeSuggestions) {
        List<SuggestionDTO> suggestions = includeSuggestions
                ? getSuggestionsForProfileHistory(history.getId(), history.getTone())
                : null;

        return HistoryDTO.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .personProfileId(history.getPersonProfileId())
                .chatContent(history.getChatContent())
                .roleBackground(history.getRoleBackground())
                .userIntent(history.getUserIntent())
                .modelUsed(history.getModelUsed())
                .tone(history.getTone())
                .isFavorite(history.getIsFavorite() != null && history.getIsFavorite() == 1)
                .createTime(history.getCreateTime() != null ? history.getCreateTime().format(HISTORY_TIME_FORMATTER) : null)
                .suggestions(suggestions)
                .build();
    }

    private List<SuggestionDTO> getSuggestionsForProfileHistory(String historyId, String tone) {
        QueryWrapper<ProfileReplySuggestion> wrapper = new QueryWrapper<>();
        wrapper.eq("history_id", historyId)
                .orderByAsc("order_index");

        String displayTone = tone != null && !tone.isEmpty() ? tone : "自然得体";

        return profileReplySuggestionMapper.selectList(wrapper).stream()
                .map(suggestion -> {
                    String storedText = suggestion.getSuggestionText();
                    String content;
                    String reason;

                    if (storedText != null && storedText.contains("|||REASON|||")) {
                        String[] parts = storedText.split("\\|\\|\\|REASON\\|\\|\\|", 2);
                        content = parts[0];
                        reason = parts.length > 1 ? parts[1] : "基于人物档案生成的推荐回复";
                    } else {
                        content = storedText;
                        reason = "使用" + displayTone + "语气生成的推荐回复";
                    }

                    return SuggestionDTO.builder()
                            .id(suggestion.getId())
                            .content(content)
                            .reason(reason)
                            .tone(displayTone)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
