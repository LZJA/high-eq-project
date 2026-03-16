package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.UserStatistics;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserStatisticsMapper extends BaseMapper<UserStatistics> {
    @Update("""
            UPDATE user_statistics
            SET reply_count = reply_count + 1
            WHERE user_id = #{userId} AND date = CURDATE()
            """)
    int incrementReplyCount(@Param("userId") String userId);

    @Update("""
            UPDATE user_statistics
            SET profile_reply_count = profile_reply_count + 1
            WHERE user_id = #{userId} AND date = CURDATE()
            """)
    int incrementProfileReplyCount(@Param("userId") String userId);

    @Update("""
            UPDATE user_statistics
            SET upgrade_click_count = upgrade_click_count + 1,
                lite_upgrade_click_count = lite_upgrade_click_count + CASE WHEN #{targetTier} = 'lite' THEN 1 ELSE 0 END,
                pro_upgrade_click_count = pro_upgrade_click_count + CASE WHEN #{targetTier} = 'pro' THEN 1 ELSE 0 END
            WHERE user_id = #{userId} AND date = CURDATE()
            """)
    int incrementUpgradeClickCount(@Param("userId") String userId, @Param("targetTier") String targetTier);
}
