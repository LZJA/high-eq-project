package com.highiq.service;

import com.highiq.dto.payment.CreatePaymentOrderRequest;
import com.highiq.dto.payment.PaymentOrderDTO;
import com.highiq.entity.ManualPaymentOrder;
import com.highiq.enums.PaymentPlan;
import com.highiq.mapper.ManualPaymentOrderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class ManualPaymentService {
    private static final char[] ORDER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private final ManualPaymentOrderMapper orderMapper;
    private final String liteUrl;
    private final String proUrl;
    private final String liteQrUrl;
    private final String proQrUrl;
    private final SecureRandom random = new SecureRandom();

    public ManualPaymentService(ManualPaymentOrderMapper orderMapper,
                                @org.springframework.beans.factory.annotation.Value("${payment.alipay.lite-url:}") String liteUrl,
                                @org.springframework.beans.factory.annotation.Value("${payment.alipay.pro-url:}") String proUrl,
                                @org.springframework.beans.factory.annotation.Value("${payment.alipay.lite-qr-url:}") String liteQrUrl,
                                @org.springframework.beans.factory.annotation.Value("${payment.alipay.pro-qr-url:}") String proQrUrl) {
        this.orderMapper = orderMapper;
        this.liteUrl = liteUrl;
        this.proUrl = proUrl;
        this.liteQrUrl = liteQrUrl;
        this.proQrUrl = proQrUrl;
    }

    @Transactional
    public PaymentOrderDTO createOrder(String userId, CreatePaymentOrderRequest request) {
        PaymentPlan plan = PaymentPlan.fromTier(request.getTier());
        ManualPaymentOrder existing = orderMapper.selectOpenOrder(userId, plan.getTier());
        if (existing != null) {
            return toDto(existing);
        }
        ManualPaymentOrder order = ManualPaymentOrder.builder()
                .orderNo(nextOrderNo()).userId(userId).email(request.getEmail().trim())
                .tier(plan.getTier()).amountCents(plan.getAmountCents()).status("PENDING").build();
        orderMapper.insert(order);
        return toDto(order);
    }

    @Transactional
    public PaymentOrderDTO submitOrder(String userId, String orderId) {
        ManualPaymentOrder order = orderMapper.selectById(orderId);
        if (order == null || !userId.equals(order.getUserId()) || !"PENDING".equals(order.getStatus())) {
            throw new IllegalArgumentException("订单不存在或不可提交");
        }
        order.setStatus("SUBMITTED");
        order.setSubmittedTime(LocalDateTime.now());
        orderMapper.updateById(order);
        return toDto(order);
    }

    private PaymentOrderDTO toDto(ManualPaymentOrder order) {
        boolean isLite = "lite".equals(order.getTier());
        return PaymentOrderDTO.builder().id(order.getId()).orderNo(order.getOrderNo()).email(order.getEmail())
                .tier(order.getTier()).amountCents(order.getAmountCents()).status(order.getStatus())
                .paymentUrl(isLite ? liteUrl : proUrl).qrImageUrl(isLite ? liteQrUrl : proQrUrl)
                .submittedTime(order.getSubmittedTime()).issuedTime(order.getIssuedTime()).mailedTime(order.getMailedTime()).build();
    }

    private String nextOrderNo() {
        StringBuilder value = new StringBuilder("PM");
        for (int index = 0; index < 16; index++) value.append(ORDER_ALPHABET[random.nextInt(ORDER_ALPHABET.length)]);
        return value.toString();
    }
}
