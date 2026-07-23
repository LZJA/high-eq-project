package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.ManualPaymentOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ManualPaymentOrderMapper extends BaseMapper<ManualPaymentOrder> {
    @Select("SELECT * FROM manual_payment_order WHERE user_id = #{userId} AND tier = #{tier} "
            + "AND status IN ('PENDING', 'SUBMITTED', 'ISSUED') ORDER BY create_time DESC LIMIT 1")
    ManualPaymentOrder selectOpenOrder(@Param("userId") String userId, @Param("tier") String tier);
}
