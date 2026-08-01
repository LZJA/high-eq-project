package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.highiq.entity.History;
import com.highiq.entity.ReplySuggestion;
import com.highiq.mapper.HistoryMapper;
import com.highiq.mapper.ProfileChatHistoryMapper;
import com.highiq.mapper.ProfileReplySuggestionMapper;
import com.highiq.mapper.ReplySuggestionMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReplyServiceDeleteHistoryTest {
    private HistoryMapper historyMapper;
    private ReplySuggestionMapper replySuggestionMapper;
    private ReplyService service;

    @BeforeEach
    void setUp() {
        historyMapper = mock(HistoryMapper.class);
        replySuggestionMapper = mock(ReplySuggestionMapper.class);
        service = new ReplyService(
                mock(AiService.class),
                mock(QwenVisionService.class),
                mock(DoubaoVisionService.class),
                replySuggestionMapper,
                mock(ProfileChatHistoryMapper.class),
                mock(ProfileReplySuggestionMapper.class),
                mock(QuotaService.class),
                mock(PersonProfileService.class),
                mock(StatisticsService.class)
        );
        ReflectionTestUtils.setField(service, "baseMapper", historyMapper);
    }

    @Test
    void deleteHistoryAlsoDeletesStoredReplySuggestions() {
        History history = History.builder()
                .id("history-1")
                .userId("user-1")
                .status(1)
                .build();
        when(historyMapper.selectById("history-1")).thenReturn(history);

        service.deleteHistory("history-1", "user-1");

        ArgumentCaptor<QueryWrapper<ReplySuggestion>> captor = ArgumentCaptor.forClass(QueryWrapper.class);
        verify(replySuggestionMapper).delete(captor.capture());
        assertThat(captor.getValue().getSqlSegment()).contains("history_id");
        assertThat(history.getStatus()).isZero();
        verify(historyMapper).updateById(history);
    }
}
