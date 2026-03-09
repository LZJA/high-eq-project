package com.highiq.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 订阅过期检查定时任务
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionExpiryScheduler {

    private final QuotaService quotaService;

    /**
     * 每10分钟检查一次订阅过期并自动降级
     */
    @Scheduled(cron = "0 */10 * * * ?")
    public void checkAndDowngradeExpiredSubscriptions() {
        int affected = quotaService.downgradeExpiredSubscriptions();
        if (affected > 0) {
            log.info("Downgraded {} expired subscriptions to free tier", affected);
        }
    }
}
