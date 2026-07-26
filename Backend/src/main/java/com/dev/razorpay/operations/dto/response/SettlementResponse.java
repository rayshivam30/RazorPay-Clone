package com.dev.razorpay.operations.dto.response;

import com.dev.razorpay.common.entity.Money;
import com.dev.razorpay.common.enums.SettlementStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record SettlementResponse(
        UUID id,
        UUID merchantId,
        Money grossAmount,
        Money refundAmount,
        Money feeAmount,
        Money gstAmount,
        Money netAmount,
        SettlementStatus status,
        String bankReference,
        LocalDateTime processedAt,
        LocalDateTime createdAt
) {
}
