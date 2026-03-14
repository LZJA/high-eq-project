package com.highiq.service;

import com.highiq.dto.GenerateReplyRequest;
import com.highiq.dto.GenerateReplyResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDate;

@Slf4j
@Service
public class GuestReplyService {

    private static final int DAILY_LIMIT = 5;
    private final Map<String, DailyQuota> quotaMap = new ConcurrentHashMap<>();
    private final ReplyService replyService;

    public GuestReplyService(ReplyService replyService) {
        this.replyService = replyService;
    }

    public GenerateReplyResponse generateReplies(String clientIp, GenerateReplyRequest request) {
        if (!checkAndConsumeQuota(clientIp)) {
            throw new IllegalStateException("今日免费次数已用完，请注册后继续使用");
        }
        return replyService.generateRepliesForGuest(request);
    }

    public int getRemainingQuota(String clientIp) {
        DailyQuota quota = quotaMap.get(clientIp);
        if (quota == null || !quota.date.equals(LocalDate.now())) {
            return DAILY_LIMIT;
        }
        return Math.max(0, DAILY_LIMIT - quota.count);
    }

    private boolean checkAndConsumeQuota(String clientIp) {
        LocalDate today = LocalDate.now();
        DailyQuota quota = quotaMap.computeIfAbsent(clientIp, k -> new DailyQuota(today, 0));

        if (!quota.date.equals(today)) {
            quota.date = today;
            quota.count = 0;
        }

        if (quota.count >= DAILY_LIMIT) {
            return false;
        }

        quota.count++;
        return true;
    }

    private static class DailyQuota {
        LocalDate date;
        int count;

        DailyQuota(LocalDate date, int count) {
            this.date = date;
            this.count = count;
        }
    }
}
