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
import java.time.temporal.ChronoUnit;
import java.security.SecureRandom;

@Service
public class ActivationCodeService {
    private static final char[] CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
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

    public IssuedCode createCode(String recipientUserId, String tier, int durationMonths, String sourceOrderId) {
        String rawCode = formatCode(tier);
        ActivationCode code = ActivationCode.builder().codeHash(hash(normalize(rawCode))).recipientUserId(recipientUserId)
                .tier(tier).durationMonths(durationMonths).status("ACTIVE").sourceOrderId(sourceOrderId)
                .expiresAt(LocalDateTime.now().plus(30, ChronoUnit.DAYS)).build();
        codeMapper.insert(code);
        return new IssuedCode(code, rawCode);
    }

    private String formatCode(String tier) {
        SecureRandom random = new SecureRandom();
        StringBuilder value = new StringBuilder("HEQ-").append(tier.toUpperCase());
        for (int group = 0; group < 3; group++) {
            value.append('-');
            for (int index = 0; index < 4; index++) value.append(CODE_ALPHABET[random.nextInt(CODE_ALPHABET.length)]);
        }
        return value.toString();
    }

    public record IssuedCode(ActivationCode code, String rawCode) { }
}
