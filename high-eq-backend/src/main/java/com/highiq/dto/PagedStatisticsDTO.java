package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedStatisticsDTO {
    private List<UserStatisticsDTO> data;
    private Integer total;
    private Integer page;
    private Integer pageSize;
}
