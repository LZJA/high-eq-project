package com.highiq.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 历史记录 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDTO {
    
    private String id;
    
    private String userId;
    
    private String chatContent;
    
    private String roleBackground;
    
    private String userIntent;
    
    private String modelUsed;
    
    private Integer isFavorite;
    
    private LocalDateTime createTime;
}
