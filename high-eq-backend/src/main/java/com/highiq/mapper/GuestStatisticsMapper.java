package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.GuestStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface GuestStatisticsMapper extends BaseMapper<GuestStatistics> {
    @Update("""
            UPDATE guest_statistics
            SET reply_count = reply_count + 1
            WHERE client_ip = #{clientIp}
            """)
    int incrementReplyCount(@Param("clientIp") String clientIp);

    @Update("""
            UPDATE guest_statistics
            SET upgrade_click_count = upgrade_click_count + 1,
                lite_upgrade_click_count = lite_upgrade_click_count + CASE WHEN #{targetTier} = 'lite' THEN 1 ELSE 0 END,
                pro_upgrade_click_count = pro_upgrade_click_count + CASE WHEN #{targetTier} = 'pro' THEN 1 ELSE 0 END
            WHERE client_ip = #{clientIp}
            """)
    int incrementUpgradeClickCount(@Param("clientIp") String clientIp, @Param("targetTier") String targetTier);
}
