package com.highiq.dto.payment;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentOrderDTO {
    private String id;
    private String orderNo;
    private String email;
    private String tier;
    private Integer amountCents;
    private String status;
    private String paymentUrl;
    private String qrImageUrl;
    private LocalDateTime submittedTime;
    private LocalDateTime issuedTime;
    private LocalDateTime mailedTime;
}
