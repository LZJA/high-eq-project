package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsOverviewDTO {
    private Long todayNewGuests;
    private Long todayNewUsers;
    private Long totalGuests;
    private Long totalUsers;
    private Long freeUsers;
    private Long liteUsers;
    private Long proUsers;
}
