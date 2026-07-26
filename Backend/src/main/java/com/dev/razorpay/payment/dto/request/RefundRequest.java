package com.dev.razorpay.payment.dto.request;

import com.dev.razorpay.common.entity.Money;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record RefundRequest(
        @NotNull(message = "Payment ID is required")
        UUID paymentId,

        @NotNull(message = "Amount is required")
        Money amount,

        String reason,

        Map<String, Object> notes
) {
}
