package com.highiq.payment;

import com.highiq.dto.payment.CreatePaymentOrderRequest;
import com.highiq.dto.payment.PaymentOrderDTO;
import com.highiq.entity.ManualPaymentOrder;
import com.highiq.mapper.ManualPaymentOrderMapper;
import com.highiq.service.ManualPaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ManualPaymentServiceTest {
    private ManualPaymentOrderMapper orderMapper;
    private ManualPaymentService service;

    @BeforeEach
    void setUp() {
        orderMapper = mock(ManualPaymentOrderMapper.class);
        service = new ManualPaymentService(orderMapper, "https://lite.example", "https://pro.example",
                "/images/lite.jpg", "/images/pro.jpg");
    }

    @Test
    void createsLiteOrderWithServerOwnedPriceAndPaymentDetails() {
        when(orderMapper.selectOpenOrder("user-1", "lite")).thenReturn(null);
        CreatePaymentOrderRequest request = new CreatePaymentOrderRequest();
        request.setTier("lite");
        request.setEmail("buyer@example.com");

        PaymentOrderDTO order = service.createOrder("user-1", request);

        assertThat(order.getTier()).isEqualTo("lite");
        assertThat(order.getAmountCents()).isEqualTo(499);
        assertThat(order.getPaymentUrl()).isEqualTo("https://lite.example");
        verify(orderMapper).insert(any(ManualPaymentOrder.class));
    }

    @Test
    void preventsAnotherUserFromSubmittingAnOrder() {
        when(orderMapper.selectById("order-1")).thenReturn(ManualPaymentOrder.builder()
                .id("order-1").userId("user-1").status("PENDING").build());

        assertThatThrownBy(() -> service.submitOrder("user-2", "order-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("订单不存在或不可提交");
    }
}
