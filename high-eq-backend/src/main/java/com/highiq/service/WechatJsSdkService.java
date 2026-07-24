package com.highiq.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.highiq.dto.WechatJsSdkSignatureResponse;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

@Service
public class WechatJsSdkService {
    private static final List<String> SHARE_JS_API_LIST = List.of(
            "updateAppMessageShareData",
            "updateTimelineShareData",
            "onMenuShareAppMessage",
            "onMenuShareTimeline"
    );
    private static final char[] NONCE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final long REFRESH_SAFETY_SECONDS = 300L;

    private final String appId;
    private final String appSecret;
    private final WebClient webClient;
    private final SecureRandom random = new SecureRandom();

    private volatile CachedValue accessToken = CachedValue.empty();
    private volatile CachedValue jsApiTicket = CachedValue.empty();

    public WechatJsSdkService(
            @Value("${wechat.mp.app-id:}") String appId,
            @Value("${wechat.mp.app-secret:}") String appSecret,
            WebClient.Builder webClientBuilder
    ) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.webClient = webClientBuilder.baseUrl("https://api.weixin.qq.com").build();
    }

    public WechatJsSdkSignatureResponse createSignature(String url) {
        if (appId == null || appId.isBlank() || appSecret == null || appSecret.isBlank()) {
            throw new IllegalStateException("微信 JS-SDK 配置不完整");
        }
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("签名 URL 不能为空");
        }

        String nonceStr = nextNonce();
        long timestamp = Instant.now().getEpochSecond();
        String ticket = getJsApiTicket();

        return WechatJsSdkSignatureResponse.builder()
                .appId(appId)
                .timestamp(timestamp)
                .nonceStr(nonceStr)
                .signature(sign(ticket, nonceStr, timestamp, url))
                .jsApiList(SHARE_JS_API_LIST)
                .build();
    }

    public static String sign(String jsApiTicket, String nonceStr, long timestamp, String url) {
        String raw = "jsapi_ticket=" + jsApiTicket
                + "&noncestr=" + nonceStr
                + "&timestamp=" + timestamp
                + "&url=" + url;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("微信 JS-SDK 签名生成失败", e);
        }
    }

    private synchronized String getAccessToken() {
        if (accessToken.isValid()) {
            return accessToken.value();
        }

        WechatTokenResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/cgi-bin/token")
                        .queryParam("grant_type", "client_credential")
                        .queryParam("appid", appId)
                        .queryParam("secret", appSecret)
                        .build())
                .retrieve()
                .bodyToMono(WechatTokenResponse.class)
                .block();

        if (response == null || response.getAccessToken() == null || response.getAccessToken().isBlank()) {
            throw new IllegalStateException("微信 access_token 获取失败");
        }

        accessToken = CachedValue.of(response.getAccessToken(), response.getExpiresIn());
        return accessToken.value();
    }

    private synchronized String getJsApiTicket() {
        if (jsApiTicket.isValid()) {
            return jsApiTicket.value();
        }

        WechatTicketResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/cgi-bin/ticket/getticket")
                        .queryParam("access_token", getAccessToken())
                        .queryParam("type", "jsapi")
                        .build())
                .retrieve()
                .bodyToMono(WechatTicketResponse.class)
                .block();

        if (response == null || response.getTicket() == null || response.getTicket().isBlank()) {
            throw new IllegalStateException("微信 jsapi_ticket 获取失败");
        }
        if (response.getErrCode() != null && response.getErrCode() != 0) {
            throw new IllegalStateException("微信 jsapi_ticket 获取失败");
        }

        jsApiTicket = CachedValue.of(response.getTicket(), response.getExpiresIn());
        return jsApiTicket.value();
    }

    private String nextNonce() {
        StringBuilder nonce = new StringBuilder(16);
        for (int index = 0; index < 16; index++) {
            nonce.append(NONCE_ALPHABET[random.nextInt(NONCE_ALPHABET.length)]);
        }
        return nonce.toString();
    }

    private record CachedValue(String value, long expiresAtEpochSecond) {
        static CachedValue empty() {
            return new CachedValue("", 0L);
        }

        static CachedValue of(String value, Integer expiresIn) {
            long seconds = expiresIn == null ? 7200L : Math.max(0L, expiresIn - REFRESH_SAFETY_SECONDS);
            return new CachedValue(value, Instant.now().getEpochSecond() + seconds);
        }

        boolean isValid() {
            return value != null && !value.isBlank() && Instant.now().getEpochSecond() < expiresAtEpochSecond;
        }
    }

    @Data
    private static class WechatTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;

        @JsonProperty("expires_in")
        private Integer expiresIn;
    }

    @Data
    private static class WechatTicketResponse {
        @JsonProperty("errcode")
        private Integer errCode;

        @JsonProperty("errmsg")
        private String errMsg;

        private String ticket;

        @JsonProperty("expires_in")
        private Integer expiresIn;
    }
}
