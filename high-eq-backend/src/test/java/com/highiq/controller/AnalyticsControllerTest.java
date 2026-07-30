package com.highiq.controller;

import com.highiq.dto.UpgradeClickDTO;
import com.highiq.service.StatisticsService;
import com.highiq.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AnalyticsControllerTest {
    private StatisticsService statisticsService;
    private AnalyticsController controller;

    @BeforeEach
    void setUp() {
        statisticsService = mock(StatisticsService.class);
        controller = new AnalyticsController(statisticsService, mock(JwtUtil.class));
    }

    @Test
    void recordsGuestUpgradeClickWithSameClientKeyAsGuestReply() {
        UpgradeClickDTO dto = new UpgradeClickDTO();
        dto.setTargetTier("lite");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.9, 10.0.0.2");
        request.addHeader("X-Guest-Id", "guest-abc_123");

        controller.trackUpgradeClick(dto, null, request);

        verify(statisticsService).recordGuestUpgradeClick("203.0.113.9:guest-abc_123", "lite");
    }
}
