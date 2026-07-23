package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.TalkTypeDeepReportRequest;
import com.highiq.dto.TalkTypeDeepReportResponse;
import com.highiq.service.TalkTypeReportService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/guest/talktype")
@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)
public class GuestTalkTypeController {
    private final TalkTypeReportService talkTypeReportService;

    public GuestTalkTypeController(TalkTypeReportService talkTypeReportService) {
        this.talkTypeReportService = talkTypeReportService;
    }

    @PostMapping("/deep-report")
    public ApiResponse<TalkTypeDeepReportResponse> generateDeepReport(@Valid @RequestBody TalkTypeDeepReportRequest request) {
        try {
            return ApiResponse.success("TalkType 深度报告生成成功", talkTypeReportService.generateDeepReport(request));
        } catch (Exception e) {
            log.error("Failed to generate TalkType deep report", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
