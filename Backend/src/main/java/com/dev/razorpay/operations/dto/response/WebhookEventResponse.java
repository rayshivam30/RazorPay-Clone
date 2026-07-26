package com.dev.razorpay.operations.dto.response;

import com.dev.razorpay.common.enums.WebhookEventStatus;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record WebhookEventResponse(
        UUID id,
        UUID merchantId,
        String eventType,
        Map<String, Object> payload,
        String targetUrl,
        String signature,
        WebhookEventStatus status,
        Integer attempts,
        LocalDateTime nextRetryAt,
        LocalDateTime lastAttemptAt,
        Integer lastResponseCode,
        String lastResponseBody,
        LocalDateTime deliveredAt,
        LocalDateTime createdAt
) {
}
