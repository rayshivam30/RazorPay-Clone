package com.dev.razorpay.operations.service;

import com.dev.razorpay.common.entity.OutboxEvent;
import com.dev.razorpay.operations.dto.response.WebhookEventResponse;

import java.util.List;
import java.util.UUID;

public interface WebhookService {

    void processOutboxEvent(OutboxEvent outboxEvent);

    void dispatchPendingWebhooks();

    List<WebhookEventResponse> getEventsByMerchant(UUID merchantId);
}
