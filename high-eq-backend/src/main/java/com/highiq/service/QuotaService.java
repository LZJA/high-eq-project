package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.highiq.dto.QuotaStatusDTO;
import com.highiq.entity.User;
import com.highiq.enums.SubscriptionTier;
import com.highiq.mapper.UserMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 配额与订阅服务
 */
@Slf4j
@Service
public class QuotaService extends ServiceImpl<UserMapper, User> {

    private static final int DEFAULT_SUBSCRIPTION_MONTHS = 1;

    /**
     * 检查并消耗配额
     */
    @Transactional
    public boolean checkAndConsumeQuota(String userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        user = ensureSubscriptionValid(user);
        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());

        if (tier.isUnlimited()) {
            return true;
        }

        resetDailyQuotaIfNeeded(user);
        user = baseMapper.selectById(userId);

        if (user.getDailyQuotaUsed() >= user.getDailyQuota()) {
            return false;
        }

        user.setDailyQuotaUsed(user.getDailyQuotaUsed() + 1);
        baseMapper.updateById(user);
        return true;
    }

    /**
     * 如有必要重置每日配额
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

        user = ensureSubscriptionValid(user);
        resetDailyQuotaIfNeeded(user);
        user = baseMapper.selectById(userId);

        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());
        int remainingQuota = tier.isUnlimited() ? -1 : Math.max(0, user.getDailyQuota() - user.getDailyQuotaUsed());

        LocalDateTime endTime = user.getSubscriptionEndTime();
        Long remainingSeconds = endTime == null ? null : Math.max(0L, Duration.between(LocalDateTime.now(), endTime).getSeconds());

        return QuotaStatusDTO.builder()
                .tier(tier.getCode())
                .dailyQuota(user.getDailyQuota())
                .dailyQuotaUsed(user.getDailyQuotaUsed())
                .remainingQuota(remainingQuota)
                .isUnlimited(tier.isUnlimited())
                .resetDate(user.getQuotaResetDate())
                .availableModels(tier.getAllowedModels())
                .subscriptionEndTime(endTime)
                .subscriptionRemainingSeconds(remainingSeconds)
                .subscriptionExpired(false)
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

        user = ensureSubscriptionValid(user);
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
        user = ensureSubscriptionValid(user);
        return SubscriptionTier.fromCode(user.getSubscriptionTier());
    }

    /**
     * 升级订阅并设置到期时间（支付成功后调用）
     */
    @Transactional
    public QuotaStatusDTO upgradeSubscription(String userId, String targetTierCode, Integer durationMonths) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        SubscriptionTier targetTier = SubscriptionTier.fromCode(targetTierCode);
        if (targetTier == SubscriptionTier.FREE) {
            throw new RuntimeException("升级目标必须是 lite 或 pro");
        }

        int months = (durationMonths == null || durationMonths < 1) ? DEFAULT_SUBSCRIPTION_MONTHS : durationMonths;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime baseTime = user.getSubscriptionEndTime() != null && user.getSubscriptionEndTime().isAfter(now)
                ? user.getSubscriptionEndTime()
                : now;
        LocalDateTime newEndTime = baseTime.plusMonths(months);

        user.setSubscriptionTier(targetTier.getCode());
        user.setSubscriptionEndTime(newEndTime);
        user.setDailyQuota(targetTier.getDailyQuota());
        user.setDailyQuotaUsed(0);
        user.setQuotaResetDate(LocalDate.now());
        baseMapper.updateById(user);

        log.info("Upgraded user {} to {} until {}", userId, targetTier.getCode(), newEndTime);
        return getQuotaStatus(userId);
    }

    /**
     * 定时任务调用：降级全部已过期用户
     */
    @Transactional
    public int downgradeExpiredSubscriptions() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("subscription_tier", "lite", "pro")
                .isNotNull("subscription_end_time")
                .le("subscription_end_time", LocalDateTime.now());

        List<User> expiredUsers = baseMapper.selectList(queryWrapper);
        int affected = 0;
        for (User user : expiredUsers) {
            downgradeToFree(user);
            affected++;
        }
        return affected;
    }

    /**
     * 确保当前用户订阅有效，过期则立即降级
     */
    @Transactional
    public User ensureSubscriptionValid(User user) {
        if (user == null) {
            return null;
        }
        if (isSubscriptionExpired(user)) {
            downgradeToFree(user);
            return baseMapper.selectById(user.getId());
        }
        return user;
    }

    private boolean isSubscriptionExpired(User user) {
        SubscriptionTier tier = SubscriptionTier.fromCode(user.getSubscriptionTier());
        if (tier == SubscriptionTier.FREE) {
            return false;
        }
        return user.getSubscriptionEndTime() != null
                && !user.getSubscriptionEndTime().isAfter(LocalDateTime.now());
    }

    private void downgradeToFree(User user) {
        user.setSubscriptionTier(SubscriptionTier.FREE.getCode());
        user.setSubscriptionEndTime(null);
        user.setDailyQuota(SubscriptionTier.FREE.getDailyQuota());
        user.setDailyQuotaUsed(0);
        user.setQuotaResetDate(LocalDate.now());
        baseMapper.updateById(user);
        log.info("Subscription expired, downgraded user {} to free", user.getId());
    }
}
