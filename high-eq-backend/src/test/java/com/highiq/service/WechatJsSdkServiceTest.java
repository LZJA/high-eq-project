package com.highiq.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WechatJsSdkServiceTest {

    @Test
    void buildsStableJsSdkSignature() {
        String signature = WechatJsSdkService.sign(
                "ticket",
                "nonce",
                123L,
                "https://www.higheq.top/talktype/result/abc?x=1"
        );

        assertEquals("ad30ac3ba2defa499566e821b725abef06f7a8d6", signature);
    }
}
