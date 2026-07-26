package com.dev.razorpay.operations.repository;

import com.dev.razorpay.common.enums.WebhookEventStatus;
import com.dev.razorpay.operations.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {
    List<WebhookEvent> findByMerchantId(UUID merchantId);

    List<WebhookEvent> findByStatusAndNextRetryAtBefore(WebhookEventStatus status, LocalDateTime now);
}
