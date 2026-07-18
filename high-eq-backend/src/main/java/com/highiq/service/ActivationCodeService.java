package com.highiq.service;

import com.highiq.dto.QuotaStatusDTO;
import com.highiq.entity.ActivationCode;
import com.highiq.entity.ActivationCodeRedemption;
import com.highiq.mapper.ActivationCodeMapper;
import com.highiq.mapper.ActivationCodeRedemptionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Service
public class ActivationCodeService {
    private final ActivationCodeMapper codeMapper;
    private final ActivationCodeRedemptionMapper redemptionMapper;
    private final QuotaService quotaService;

    public ActivationCodeService(ActivationCodeMapper codeMapper,
                                 ActivationCodeRedemptionMapper redemptionMapper,
                                 QuotaService quotaService) {
        this.codeMapper = codeMapper;
        this.redemptionMapper = redemptionMapper;
        this.quotaService = quotaService;
    }

    @Transactional
    public QuotaStatusDTO redeem(String userId, String rawCode) {
        ActivationCode code = codeMapper.selectByHashForUpdate(hash(normalize(rawCode)));
        if (code == null || !"ACTIVE".equals(code.getStatus())
                || (code.getExpiresAt() != null && !code.getExpiresAt().isAfter(LocalDateTime.now()))
                || !userId.equals(code.getRecipientUserId())) {
            throw new IllegalArgumentException("兑换码无效或不可用");
        }

        code.setStatus("REDEEMED");
        code.setRedeemedTime(LocalDateTime.now());
        codeMapper.updateById(code);
        redemptionMapper.insert(ActivationCodeRedemption.builder()
                .activationCodeId(code.getId())
                .userId(userId)
                .redeemedTime(code.getRedeemedTime())
                .build());

        return quotaService.upgradeSubscription(userId, code.getTier(), code.getDurationMonths());
    }

    public static String normalize(String rawCode) {
        if (rawCode == null) {
            return "";
        }
        return rawCode.replaceAll("[\\s-]", "").toUpperCase();
    }

    public static String hash(String normalizedCode) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(normalizedCode.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(64);
            for (byte value : bytes) {
                builder.append(String.format("%02x", value));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 不可用", exception);
        }
    }
}
