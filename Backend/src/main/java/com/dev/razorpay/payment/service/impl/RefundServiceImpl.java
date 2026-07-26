package com.dev.razorpay.payment.service.impl;

import com.dev.razorpay.common.enums.PaymentStatus;
import com.dev.razorpay.common.enums.RefundStatus;
import com.dev.razorpay.common.exception.BusinessRuleViolationException;
import com.dev.razorpay.common.exception.ResourceNotFoundException;
import com.dev.razorpay.common.util.RandomizerUtil;
import com.dev.razorpay.payment.dto.request.RefundRequest;
import com.dev.razorpay.payment.dto.response.RefundResponse;
import com.dev.razorpay.payment.entity.Payment;
import com.dev.razorpay.payment.entity.Refund;
import com.dev.razorpay.payment.mapper.RefundMapper;
import com.dev.razorpay.payment.repository.PaymentRepository;
import com.dev.razorpay.payment.repository.RefundRepository;
import com.dev.razorpay.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.dev.razorpay.common.entity.OutboxEvent;
import com.dev.razorpay.common.repository.OutboxEventRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final RefundMapper refundMapper;
    private final OutboxEventRepository outboxEventRepository;

    @Override
    @Transactional
    public RefundResponse createRefund(UUID merchantId, RefundRequest request) {
        Payment payment = paymentRepository.findByIdAndMerchantId(request.paymentId(), merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", request.paymentId()));

        if (payment.getStatus() != PaymentStatus.CAPTURED && 
            payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED && 
            payment.getStatus() != PaymentStatus.SETTLED) {
            throw new BusinessRuleViolationException("PAYMENT_NOT_REFUNDABLE",
                    "Payment cannot be refunded in status: " + payment.getStatus());
        }

        List<Refund> existingRefunds = refundRepository.findByPayment_Id(payment.getId());
        int totalRefundedSoFar = existingRefunds.stream()
                .filter(r -> r.getStatus() == RefundStatus.PROCESSED)
                .mapToInt(r -> r.getAmount().getAmountUnits())
                .sum();

        int requestedAmount = request.amount().getAmountUnits();
        int paymentAmount = payment.getAmount().getAmountUnits();

        if (totalRefundedSoFar + requestedAmount > paymentAmount) {
            throw new BusinessRuleViolationException("REFUND_AMOUNT_EXCEEDED",
                    "Total refund amount (" + (totalRefundedSoFar + requestedAmount) + ") exceeds payment amount (" + paymentAmount + ")");
        }

        Refund refund = Refund.builder()
                .payment(payment)
                .merchantId(merchantId)
                .amount(request.amount())
                .status(RefundStatus.PROCESSED)
                .reason(request.reason())
                .bankReference("REF_" + RandomizerUtil.randomBase64(10))
                .notes(request.notes())
                .processedAt(LocalDateTime.now())
                .build();

        refund = refundRepository.save(refund);

        // Update payment status based on refund amount
        if (totalRefundedSoFar + requestedAmount == paymentAmount) {
            // Full refund - payment is completely refunded
            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRefundedAt(LocalDateTime.now());
        } else {
            // Partial refund - payment is partially refunded
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            if (payment.getRefundedAt() == null) {
                payment.setRefundedAt(LocalDateTime.now());
            }
        }
        paymentRepository.save(payment);

        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("REFUND")
                .aggregateId(refund.getId().toString())
                .eventType("refund.created")
                .merchantId(merchantId)
                .payload("{\"refundId\":\"" + refund.getId() + "\",\"paymentId\":\"" + payment.getId() + "\",\"amount\":" + refund.getAmount().getAmountUnits() + "}")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());

        log.info("Refund created successfully for paymentId: {}, refundId: {}", payment.getId(), refund.getId());

        return refundMapper.toResponse(refund);
    }

    @Override
    @Transactional(readOnly = true)
    public RefundResponse getRefundById(UUID merchantId, UUID refundId) {
        Refund refund = refundRepository.findByIdAndMerchantId(refundId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund", refundId));
        return refundMapper.toResponse(refund);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponse> listRefundsByPayment(UUID merchantId, UUID paymentId) {
        Payment payment = paymentRepository.findByIdAndMerchantId(paymentId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        List<Refund> refunds = refundRepository.findByPayment_Id(payment.getId());
        return refundMapper.toResponseList(refunds);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponse> listRefundsByMerchant(UUID merchantId) {
        List<Refund> refunds = refundRepository.findByMerchantId(merchantId);
        return refundMapper.toResponseList(refunds);
    }
}
