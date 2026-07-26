package com.dev.razorpay.payment.dto.response;

import com.dev.razorpay.common.entity.Money;
import com.dev.razorpay.common.enums.RefundStatus;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record RefundResponse(
        UUID id,
        UUID paymentId,
        UUID merchantId,
        Money amount,
        RefundStatus status,
        String reason,
        String bankReference,
        String errorCode,
        String errorDescription,
        Map<String, Object> notes,
        LocalDateTime processedAt,
        LocalDateTime createdAt
) {
}
