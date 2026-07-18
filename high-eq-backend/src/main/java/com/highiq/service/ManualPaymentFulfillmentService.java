package com.highiq.service;

import com.highiq.entity.ManualPaymentOrder;
import com.highiq.enums.PaymentPlan;
import com.highiq.mapper.ManualPaymentOrderMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ManualPaymentFulfillmentService {
    private final ManualPaymentOrderMapper orderMapper;
    private final ActivationCodeService activationCodeService;
    private final RedemptionMailService redemptionMailService;

    public ManualPaymentFulfillmentService(ManualPaymentOrderMapper orderMapper, ActivationCodeService activationCodeService,
                                           RedemptionMailService redemptionMailService) {
        this.orderMapper = orderMapper;
        this.activationCodeService = activationCodeService;
        this.redemptionMailService = redemptionMailService;
    }

    @Transactional
    public void issue(String orderId, String reviewerId) {
        ManualPaymentOrder order = orderMapper.selectById(orderId);
        if (order == null || !"SUBMITTED".equals(order.getStatus())) throw new IllegalArgumentException("订单不可发码");
        PaymentPlan plan = PaymentPlan.fromTier(order.getTier());
        ActivationCodeService.IssuedCode issued = activationCodeService.createCode(order.getUserId(), plan.getTier(), plan.getDurationMonths(), order.getId());
        redemptionMailService.sendCode(order.getEmail(), plan.getTier(), issued.rawCode());
        order.setActivationCodeId(issued.code().getId());
        order.setReviewerId(reviewerId);
        order.setIssuedTime(LocalDateTime.now());
        order.setMailedTime(LocalDateTime.now());
        order.setStatus("MAILED");
        orderMapper.updateById(order);
    }
}
