package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.History;
import org.apache.ibatis.annotations.Mapper;

/**
 * 会话历史 Mapper
 */
@Mapper
public interface HistoryMapper extends BaseMapper<History> {
}
