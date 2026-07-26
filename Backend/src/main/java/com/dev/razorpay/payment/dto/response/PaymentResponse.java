package com.dev.razorpay.payment.dto.response;

import com.dev.razorpay.common.entity.Money;
import com.dev.razorpay.common.enums.PaymentMethod;
import com.dev.razorpay.common.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaymentResponse(
        UUID id,
        UUID orderId,
        UUID merchantId,
        Money amount,
        PaymentStatus status,
        PaymentMethod method,
        Map<String, Object> methodDetails,
        String bankReference,
        String errorCode,
        String errorDescription,
        String errorMessage,
        LocalDateTime capturedAt,
        LocalDateTime refundedAt,
        LocalDateTime settledAt,
        LocalDateTime createdAt
) {

}
