package com.highiq.payment;

import com.highiq.dto.QuotaStatusDTO;
import com.highiq.entity.ActivationCode;
import com.highiq.mapper.ActivationCodeMapper;
import com.highiq.mapper.ActivationCodeRedemptionMapper;
import com.highiq.service.ActivationCodeService;
import com.highiq.service.QuotaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ActivationCodeServiceTest {
    private ActivationCodeMapper codeMapper;
    private ActivationCodeRedemptionMapper redemptionMapper;
    private QuotaService quotaService;
    private ActivationCodeService service;

    @BeforeEach
    void setUp() {
        codeMapper = mock(ActivationCodeMapper.class);
        redemptionMapper = mock(ActivationCodeRedemptionMapper.class);
        quotaService = mock(QuotaService.class);
        service = new ActivationCodeService(codeMapper, redemptionMapper, quotaService);
    }

    @Test
    void redeemsAnActiveCodeOnlyForItsRecipient() {
        ActivationCode code = ActivationCode.builder()
                .id("code-1")
                .recipientUserId("user-1")
                .tier("lite")
                .durationMonths(1)
                .status("ACTIVE")
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();
        QuotaStatusDTO status = QuotaStatusDTO.builder().tier("lite").build();
        when(codeMapper.selectByHashForUpdate(any())).thenReturn(code);
        when(quotaService.upgradeSubscription("user-1", "lite", 1)).thenReturn(status);

        QuotaStatusDTO result = service.redeem("user-1", "heq-lite-abcd-efgh-ijkl");

        assertThat(result).isSameAs(status);
        assertThat(code.getStatus()).isEqualTo("REDEEMED");
        assertThat(code.getRedeemedTime()).isNotNull();
        verify(codeMapper).updateById(code);
        verify(redemptionMapper).insert(any());
        verify(quotaService).upgradeSubscription("user-1", "lite", 1);
    }

    @Test
    void rejectsARecipientMismatchWithoutUpgradingSubscription() {
        ActivationCode code = ActivationCode.builder()
                .recipientUserId("user-1")
                .tier("pro")
                .durationMonths(1)
                .status("ACTIVE")
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();
        when(codeMapper.selectByHashForUpdate(any())).thenReturn(code);

        assertThatThrownBy(() -> service.redeem("user-2", "HEQ-PRO-ABCD-EFGH-IJKL"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("兑换码无效或不可用");

        verify(quotaService, org.mockito.Mockito.never()).upgradeSubscription(eq("user-2"), any(), any());
    }
}
