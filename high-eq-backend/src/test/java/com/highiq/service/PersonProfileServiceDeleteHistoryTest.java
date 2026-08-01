package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.highiq.entity.PersonProfile;
import com.highiq.entity.ProfileChatHistory;
import com.highiq.entity.ProfileReplySuggestion;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.PersonProfileMapper;
import com.highiq.mapper.ProfileChatHistoryMapper;
import com.highiq.mapper.ProfileReplySuggestionMapper;
import com.highiq.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PersonProfileServiceDeleteHistoryTest {
    private PersonProfileMapper profileMapper;
    private ProfileChatHistoryMapper historyMapper;
    private ProfileReplySuggestionMapper suggestionMapper;
    private PersonProfileService service;

    @BeforeEach
    void setUp() {
        profileMapper = mock(PersonProfileMapper.class);
        historyMapper = mock(ProfileChatHistoryMapper.class);
        suggestionMapper = mock(ProfileReplySuggestionMapper.class);
        service = new PersonProfileService(
                mock(HistoryMapper.class),
                mock(UserMapper.class),
                mock(QuotaService.class),
                historyMapper,
                suggestionMapper
        );
        ReflectionTestUtils.setField(service, "baseMapper", profileMapper);
    }

    @Test
    void deleteProfileHistoryAlsoDeletesStoredReplySuggestions() {
        PersonProfile profile = PersonProfile.builder()
                .id("profile-1")
                .userId("user-1")
                .status(1)
                .build();
        ProfileChatHistory history = ProfileChatHistory.builder()
                .id("history-1")
                .personProfileId("profile-1")
                .userId("user-1")
                .status(1)
                .build();
        when(profileMapper.selectById("profile-1")).thenReturn(profile);
        when(historyMapper.selectById("history-1")).thenReturn(history);

        service.deleteProfileHistory("profile-1", "history-1", "user-1");

        ArgumentCaptor<QueryWrapper<ProfileReplySuggestion>> captor = ArgumentCaptor.forClass(QueryWrapper.class);
        verify(suggestionMapper).delete(captor.capture());
        assertThat(captor.getValue().getSqlSegment()).contains("history_id");
        assertThat(history.getStatus()).isZero();
        verify(historyMapper).updateById(history);
    }
}
