package com.dev.razorpay.payment.service.impl;

import com.dev.razorpay.common.entity.Money;
import com.dev.razorpay.common.enums.PaymentStatus;
import com.dev.razorpay.common.enums.RefundStatus;
import com.dev.razorpay.common.exception.BusinessRuleViolationException;
import com.dev.razorpay.common.repository.OutboxEventRepository;
import com.dev.razorpay.payment.dto.request.RefundRequest;
import com.dev.razorpay.payment.dto.response.RefundResponse;
import com.dev.razorpay.payment.entity.Payment;
import com.dev.razorpay.payment.entity.Refund;
import com.dev.razorpay.payment.mapper.RefundMapper;
import com.dev.razorpay.payment.repository.PaymentRepository;
import com.dev.razorpay.payment.repository.RefundRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RefundServiceImplTest {

    private RefundRepository refundRepository;
    private PaymentRepository paymentRepository;
    private RefundMapper refundMapper;
    private OutboxEventRepository outboxEventRepository;
    private RefundServiceImpl refundService;

    private UUID merchantId;
    private UUID paymentId;
    private Payment payment;

    @BeforeEach
    void setUp() {
        refundRepository = mock(RefundRepository.class);
        paymentRepository = mock(PaymentRepository.class);
        refundMapper = mock(RefundMapper.class);
        outboxEventRepository = mock(OutboxEventRepository.class);

        refundService = new RefundServiceImpl(refundRepository, paymentRepository, refundMapper, outboxEventRepository);

        merchantId = UUID.randomUUID();
        paymentId = UUID.randomUUID();

        payment = Payment.builder()
                .id(paymentId)
                .merchantId(merchantId)
                .amount(Money.of(10000, "INR"))
                .status(PaymentStatus.CAPTURED)
                .build();
    }

    @Test
    void testCreateRefundSuccess() {
        RefundRequest request = new RefundRequest(paymentId, Money.of(5000, "INR"), "Customer request", null);

        when(paymentRepository.findByIdAndMerchantId(paymentId, merchantId)).thenReturn(Optional.of(payment));
        when(refundRepository.findByPayment_Id(paymentId)).thenReturn(Collections.emptyList());
        when(refundRepository.save(any(Refund.class))).thenAnswer(i -> {
            Refund r = i.getArgument(0);
            if (r.getId() == null) r.setId(UUID.randomUUID());
            return r;
        });

        RefundResponse expectedResponse = new RefundResponse(UUID.randomUUID(), paymentId, merchantId,
                Money.of(5000, "INR"), RefundStatus.PROCESSED, "Customer request", "REF_123", null, null, null, LocalDateTime.now(), LocalDateTime.now());
        when(refundMapper.toResponse(any())).thenReturn(expectedResponse);

        RefundResponse response = refundService.createRefund(merchantId, request);

        assertNotNull(response);
        assertEquals(RefundStatus.PROCESSED, response.status());
        verify(refundRepository).save(any(Refund.class));
        verify(outboxEventRepository).save(any());
    }

    @Test
    void testCreateRefundExceedsAmountThrowsException() {
        RefundRequest request = new RefundRequest(paymentId, Money.of(15000, "INR"), "Over refund", null);

        when(paymentRepository.findByIdAndMerchantId(paymentId, merchantId)).thenReturn(Optional.of(payment));
        when(refundRepository.findByPayment_Id(paymentId)).thenReturn(Collections.emptyList());

        assertThrows(BusinessRuleViolationException.class, () -> refundService.createRefund(merchantId, request));
    }
}
