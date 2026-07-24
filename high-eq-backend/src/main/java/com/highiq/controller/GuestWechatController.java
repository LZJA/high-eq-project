package com.highiq.controller;

import com.highiq.dto.ApiResponse;
import com.highiq.dto.WechatJsSdkSignatureResponse;
import com.highiq.service.WechatJsSdkService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/guest/wechat")
@CrossOrigin(origins = "*", allowedHeaders = "*", maxAge = 3600)
public class GuestWechatController {
    private final WechatJsSdkService wechatJsSdkService;

    public GuestWechatController(WechatJsSdkService wechatJsSdkService) {
        this.wechatJsSdkService = wechatJsSdkService;
    }

    @GetMapping("/js-sdk-signature")
    public ApiResponse<WechatJsSdkSignatureResponse> createJsSdkSignature(@RequestParam String url) {
        try {
            return ApiResponse.success("微信 JS-SDK 签名生成成功", wechatJsSdkService.createSignature(url));
        } catch (Exception e) {
            log.error("Failed to create WeChat JS-SDK signature", e);
            return ApiResponse.error(500, e.getMessage());
        }
    }
}
