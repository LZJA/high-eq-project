package com.highiq.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.highiq.entity.ActivationCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ActivationCodeMapper extends BaseMapper<ActivationCode> {
    @Select("SELECT * FROM activation_code WHERE code_hash = #{codeHash} FOR UPDATE")
    ActivationCode selectByHashForUpdate(@Param("codeHash") String codeHash);
}
