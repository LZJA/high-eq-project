package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.PersonProfile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 人物档案 Mapper
 */
@Mapper
public interface PersonProfileMapper extends BaseMapper<PersonProfile> {
}
