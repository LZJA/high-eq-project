package com.highiq.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class RedemptionMailService {
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;

    public RedemptionMailService(ObjectProvider<JavaMailSender> mailSender,
                                 @Value("${payment.mail-from:}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendCode(String email, String tier, String code) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || from.isBlank()) throw new IllegalStateException("邮件服务尚未配置");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject("HighEQ " + tier.toUpperCase() + " 会员兑换码");
        message.setText("感谢购买 HighEQ " + tier.toUpperCase() + " 月度会员。\n\n兑换码：" + code
                + "\n\n登录后在兑换入口使用。兑换码仅限当前购买账号使用，有效期 30 天。");
        sender.send(message);
    }
}
