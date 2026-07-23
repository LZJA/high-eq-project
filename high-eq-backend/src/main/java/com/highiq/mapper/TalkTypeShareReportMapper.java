package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.TalkTypeShareReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface TalkTypeShareReportMapper extends BaseMapper<TalkTypeShareReport> {
    @Select("SELECT * FROM talktype_share_report WHERE share_id = #{shareId} LIMIT 1")
    TalkTypeShareReport selectByShareId(@Param("shareId") String shareId);
}
