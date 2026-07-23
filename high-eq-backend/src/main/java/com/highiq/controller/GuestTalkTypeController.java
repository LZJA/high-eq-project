package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.TalkTypeDeepReportRequest;
import com.highiq.dto.TalkTypeDeepReportResponse;
import com.highiq.dto.TalkTypeShareReportRequest;
import com.highiq.dto.TalkTypeShareReportResponse;
import com.highiq.service.TalkTypeShareReportService;
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
    private final TalkTypeShareReportService talkTypeShareReportService;

    public GuestTalkTypeController(TalkTypeReportService talkTypeReportService, TalkTypeShareReportService talkTypeShareReportService) {
        this.talkTypeReportService = talkTypeReportService;
        this.talkTypeShareReportService = talkTypeShareReportService;
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

    @PostMapping("/reports/share")
    public ApiResponse<TalkTypeShareReportResponse> createShareReport(@Valid @RequestBody TalkTypeShareReportRequest request) {
        try {
            return ApiResponse.success("TalkType 分享报告已创建", talkTypeShareReportService.createShareReport(request));
        } catch (Exception e) {
            log.error("Failed to create TalkType share report", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }

    @GetMapping("/reports/{shareId}")
    public ApiResponse<TalkTypeShareReportResponse> getShareReport(@PathVariable String shareId) {
        try {
            return ApiResponse.success("获取成功", talkTypeShareReportService.getShareReport(shareId));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(404, e.getMessage());
        } catch (Exception e) {
            log.error("Failed to get TalkType share report", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
