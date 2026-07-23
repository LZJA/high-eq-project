package com.highiq.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.highiq.dto.PagedStatisticsDTO;
import com.highiq.dto.StatisticsOverviewDTO;
import com.highiq.dto.UpgradeClickStatsDTO;
import com.highiq.dto.UserStatisticsDTO;
import com.highiq.entity.GuestStatistics;
import com.highiq.entity.User;
import com.highiq.entity.UserStatistics;
import com.highiq.mapper.GuestStatisticsMapper;
import com.highiq.mapper.UserMapper;
import com.highiq.mapper.UserStatisticsMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class StatisticsService {

    private final GuestStatisticsMapper guestMapper;
    private final UserStatisticsMapper userStatsMapper;
    private final UserMapper userMapper;

    public StatisticsService(GuestStatisticsMapper guestMapper,
                             UserStatisticsMapper userStatsMapper,
                             UserMapper userMapper) {
        this.guestMapper = guestMapper;
        this.userStatsMapper = userStatsMapper;
        this.userMapper = userMapper;
    }

    @Transactional
    public void recordGuestReply(String clientIp) {
        if (guestMapper.incrementReplyCount(clientIp) > 0) {
            return;
        }
        if (!insertGuestStatistics(clientIp, 1, 0, 0, 0)) {
            guestMapper.incrementReplyCount(clientIp);
        }
    }

    @Transactional
    public void recordUserReply(String userId) {
        if (userStatsMapper.incrementReplyCount(userId) > 0) {
            return;
        }
        if (!insertUserStatistics(userId, 1, 0, 0, 0)) {
            userStatsMapper.incrementReplyCount(userId);
        }
    }

    @Transactional
    public void recordProfileReply(String userId) {
        if (userStatsMapper.incrementProfileReplyCount(userId) > 0) {
            return;
        }
        if (!insertUserStatistics(userId, 0, 1, 0, 0)) {
            userStatsMapper.incrementProfileReplyCount(userId);
        }
    }

    @Transactional
    public void recordUpgradeClick(String userId, String targetTier) {
        String normalizedTier = normalizeTier(targetTier);
        if (userStatsMapper.incrementUpgradeClickCount(userId, normalizedTier) > 0) {
            return;
        }
        int liteCount = "lite".equals(normalizedTier) ? 1 : 0;
        int proCount = "pro".equals(normalizedTier) ? 1 : 0;
        if (!insertUserStatistics(userId, 0, 0, liteCount, proCount)) {
            userStatsMapper.incrementUpgradeClickCount(userId, normalizedTier);
        }
    }

    @Transactional
    public void recordGuestUpgradeClick(String clientIp, String targetTier) {
        String normalizedTier = normalizeTier(targetTier);
        if (guestMapper.incrementUpgradeClickCount(clientIp, normalizedTier) > 0) {
            return;
        }
        int liteCount = "lite".equals(normalizedTier) ? 1 : 0;
        int proCount = "pro".equals(normalizedTier) ? 1 : 0;
        if (!insertGuestStatistics(clientIp, 0, 1, liteCount, proCount)) {
            guestMapper.incrementUpgradeClickCount(clientIp, normalizedTier);
        }
    }

    public UpgradeClickStatsDTO getUpgradeClickStats(String userId, String clientIp) {
        if (userId != null && !userId.isBlank()) {
            QueryWrapper<UserStatistics> wrapper = new QueryWrapper<>();
            wrapper.eq("user_id", userId);
            List<UserStatistics> statsList = userStatsMapper.selectList(wrapper);
            int totalUpgrade = 0, totalLite = 0, totalPro = 0;
            for (UserStatistics stats : statsList) {
                totalUpgrade += defaultInt(stats.getUpgradeClickCount());
                totalLite += defaultInt(stats.getLiteUpgradeClickCount());
                totalPro += defaultInt(stats.getProUpgradeClickCount());
            }
            return toUpgradeClickStats(totalUpgrade, totalLite, totalPro);
        }

        QueryWrapper<GuestStatistics> wrapper = new QueryWrapper<>();
        wrapper.eq("client_ip", clientIp);
        GuestStatistics stats = guestMapper.selectOne(wrapper);
        return toUpgradeClickStats(stats == null ? 0 : stats.getUpgradeClickCount(),
                stats == null ? 0 : stats.getLiteUpgradeClickCount(),
                stats == null ? 0 : stats.getProUpgradeClickCount());
    }

    public PagedStatisticsDTO getAllStatistics(String userType, Integer page, Integer pageSize) {
        List<UserStatisticsDTO> allResult = new ArrayList<>();

        if (!"REGISTERED".equals(userType)) {
            List<GuestStatistics> guests = guestMapper.selectList(null);
            for (GuestStatistics guest : guests) {
                allResult.add(UserStatisticsDTO.builder()
                        .id(guest.getId())
                        .clientIp(guest.getClientIp())
                        .userType("GUEST")
                        .replyCount(defaultInt(guest.getReplyCount()))
                        .profileReplyCount(0)
                        .upgradeClickCount(defaultInt(guest.getUpgradeClickCount()))
                        .liteUpgradeClickCount(defaultInt(guest.getLiteUpgradeClickCount()))
                        .proUpgradeClickCount(defaultInt(guest.getProUpgradeClickCount()))
                        .totalCount(defaultInt(guest.getReplyCount()))
                        .createTime(guest.getCreateTime())
                        .updateTime(guest.getUpdateTime())
                        .build());
            }
        }

        if (!"GUEST".equals(userType)) {
            List<User> allUsers = userMapper.selectList(null);
            for (User user : allUsers) {
                QueryWrapper<UserStatistics> wrapper = new QueryWrapper<>();
                wrapper.eq("user_id", user.getId());
                List<UserStatistics> userStatsList = userStatsMapper.selectList(wrapper);

                int totalReply = 0;
                int totalProfile = 0;
                int totalUpgrade = 0;
                int totalLite = 0;
                int totalPro = 0;
                LocalDateTime latestUpdate = user.getCreateTime();

                for (UserStatistics stats : userStatsList) {
                    totalReply += defaultInt(stats.getReplyCount());
                    totalProfile += defaultInt(stats.getProfileReplyCount());
                    totalUpgrade += defaultInt(stats.getUpgradeClickCount());
                    totalLite += defaultInt(stats.getLiteUpgradeClickCount());
                    totalPro += defaultInt(stats.getProUpgradeClickCount());
                    if (stats.getUpdateTime() != null && stats.getUpdateTime().isAfter(latestUpdate)) {
                        latestUpdate = stats.getUpdateTime();
                    }
                }

                allResult.add(UserStatisticsDTO.builder()
                        .id(user.getId())
                        .userId(user.getId())
                        .username(user.getUsername())
                        .userType("REGISTERED")
                        .subscriptionTier(user.getSubscriptionTier())
                        .replyCount(totalReply)
                        .profileReplyCount(totalProfile)
                        .upgradeClickCount(totalUpgrade)
                        .liteUpgradeClickCount(totalLite)
                        .proUpgradeClickCount(totalPro)
                        .totalCount(totalReply + totalProfile)
                        .createTime(user.getCreateTime())
                        .updateTime(latestUpdate)
                        .build());
            }
        }

        allResult.sort((a, b) -> b.getUpdateTime().compareTo(a.getUpdateTime()));

        int total = allResult.size();
        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, total);
        List<UserStatisticsDTO> pagedData = start < total ? allResult.subList(start, end) : new ArrayList<>();

        return PagedStatisticsDTO.builder()
                .data(pagedData)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .build();
    }

    public StatisticsOverviewDTO getOverview() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        QueryWrapper<GuestStatistics> guestWrapper = new QueryWrapper<>();
        guestWrapper.ge("create_time", todayStart);
        Long todayNewGuests = guestMapper.selectCount(guestWrapper);

        Long totalGuests = guestMapper.selectCount(null);

        QueryWrapper<User> userWrapper = new QueryWrapper<>();
        userWrapper.ge("create_time", todayStart);
        Long todayNewUsers = userMapper.selectCount(userWrapper);

        Long totalUsers = userMapper.selectCount(null);

        QueryWrapper<User> freeWrapper = new QueryWrapper<>();
        freeWrapper.and(w -> w.isNull("subscription_tier").or().eq("subscription_tier", "FREE"));
        Long freeUsers = userMapper.selectCount(freeWrapper);

        QueryWrapper<User> liteWrapper = new QueryWrapper<>();
        liteWrapper.eq("subscription_tier", "LITE");
        Long liteUsers = userMapper.selectCount(liteWrapper);

        QueryWrapper<User> proWrapper = new QueryWrapper<>();
        proWrapper.eq("subscription_tier", "PRO");
        Long proUsers = userMapper.selectCount(proWrapper);

        return StatisticsOverviewDTO.builder()
                .todayNewGuests(todayNewGuests)
                .todayNewUsers(todayNewUsers)
                .totalGuests(totalGuests)
                .totalUsers(totalUsers)
                .freeUsers(freeUsers)
                .liteUsers(liteUsers)
                .proUsers(proUsers)
                .build();
    }

    private boolean insertGuestStatistics(String clientIp, int replyCount, int upgradeClickCount, int liteCount, int proCount) {
        try {
            guestMapper.insert(GuestStatistics.builder()
                    .clientIp(clientIp)
                    .replyCount(replyCount)
                    .upgradeClickCount(upgradeClickCount)
                    .liteUpgradeClickCount(liteCount)
                    .proUpgradeClickCount(proCount)
                    .build());
            return true;
        } catch (DuplicateKeyException ignored) {
            log.debug("Guest statistics row already exists for {}", clientIp);
            return false;
        }
    }

    private boolean insertUserStatistics(String userId, int replyCount, int profileReplyCount, int liteCount, int proCount) {
        try {
            userStatsMapper.insert(UserStatistics.builder()
                    .userId(userId)
                    .replyCount(replyCount)
                    .profileReplyCount(profileReplyCount)
                    .upgradeClickCount(liteCount + proCount)
                    .liteUpgradeClickCount(liteCount)
                    .proUpgradeClickCount(proCount)
                    .build());
            return true;
        } catch (DuplicateKeyException ignored) {
            log.debug("User statistics row already exists for {}", userId);
            return false;
        }
    }

    private UpgradeClickStatsDTO toUpgradeClickStats(Integer totalCount, Integer liteCount, Integer proCount) {
        return UpgradeClickStatsDTO.builder()
                .totalCount(defaultInt(totalCount))
                .liteCount(defaultInt(liteCount))
                .proCount(defaultInt(proCount))
                .build();
    }

    private String normalizeTier(String targetTier) {
        if (targetTier == null) {
            return "lite";
        }
        return "pro".equalsIgnoreCase(targetTier) ? "pro" : "lite";
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }
}
