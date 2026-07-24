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
public class WechatJsSdkSignatureResponse {
    private String appId;
    private Long timestamp;
    private String nonceStr;
    private String signature;
    private List<String> jsApiList;
}
