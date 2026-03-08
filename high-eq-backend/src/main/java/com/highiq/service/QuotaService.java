package com.highiq.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.QuotaStatusDTO;
import com.highiq.entity.User;
import com.highiq.enums.SubscriptionTier;
import com.highiq.mapper.UserMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * 配额服务
 */
@Slf4j
@Service
public class QuotaService extends ServiceImpl<UserMapper, User> {

    /**
     * 检查并消耗配额
     * @param userId 用户ID
     * @return true 表示有配额，false 表示配额用尽
     */
    @Transactional
    public boolean checkAndConsumeQuota(String userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());

        // PRO 用户无限制
        if (tier.isUnlimited()) {
            return true;
        }

        // 重置每日配额（如果需要）
        resetDailyQuotaIfNeeded(user);

        // 重新获取用户信息（可能在重置时已更新）
        user = baseMapper.selectById(userId);

        // 检查配额
        if (user.getDailyQuotaUsed() >= user.getDailyQuota()) {
            return false;
        }

        // 消耗配额
        user.setDailyQuotaUsed(user.getDailyQuotaUsed() + 1);
        baseMapper.updateById(user);

        return true;
    }

    /**
     * 如果需要，重置每日配额
     */
    @Transactional
    public void resetDailyQuotaIfNeeded(User user) {
        LocalDate today = LocalDate.now();
        LocalDate resetDate = user.getQuotaResetDate();

        if (resetDate == null || !resetDate.equals(today)) {
            SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());
            user.setDailyQuota(tier.getDailyQuota());
            user.setDailyQuotaUsed(0);
            user.setQuotaResetDate(today);
            baseMapper.updateById(user);
            log.info("Reset daily quota for user {}: quota={}, used=0", user.getId(), tier.getDailyQuota());
        }
    }

    /**
     * 获取用户配额状态
     */
    public QuotaStatusDTO getQuotaStatus(String userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 确保配额是最新的
        resetDailyQuotaIfNeeded(user);
        user = baseMapper.selectById(userId);

        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());

        int remainingQuota = tier.isUnlimited() ? -1 :
            Math.max(0, user.getDailyQuota() - user.getDailyQuotaUsed());

        return QuotaStatusDTO.builder()
                .tier(tier.getCode())
                .dailyQuota(user.getDailyQuota())
                .dailyQuotaUsed(user.getDailyQuotaUsed())
                .remainingQuota(remainingQuota)
                .isUnlimited(tier.isUnlimited())
                .resetDate(user.getQuotaResetDate())
                .availableModels(tier.getAllowedModels())
                .build();
    }

    /**
     * 检查模型是否可用
     */
    public boolean isModelAvailable(String userId, String model) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            return false;
        }

        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());
        return tier.isModelAllowed(model);
    }

    /**
     * 获取用户订阅级别
     */
    public SubscriptionTier getUserTier(String userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            return SubscriptionTier.FREE;
        }
        return SubscriptionTier.fromCode(user.getSubscriptionTier());
    }
}
