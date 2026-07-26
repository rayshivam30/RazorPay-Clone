package com.dev.razorpay.operations.service.impl;

import com.dev.razorpay.common.entity.OutboxEvent;
import com.dev.razorpay.common.enums.WebhookEventStatus;
import com.dev.razorpay.merchant.entity.MerchantWebhookConfig;
import com.dev.razorpay.merchant.repository.MerchantWebhookConfigRepository;
import com.dev.razorpay.operations.dto.response.WebhookEventResponse;
import com.dev.razorpay.operations.entity.DlqEvent;
import com.dev.razorpay.operations.entity.WebhookEvent;
import com.dev.razorpay.operations.mapper.WebhookEventMapper;
import com.dev.razorpay.operations.repository.DlqEventRepository;
import com.dev.razorpay.operations.repository.WebhookEventRepository;
import com.dev.razorpay.operations.service.WebhookService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl implements WebhookService {

    private final WebhookEventRepository webhookEventRepository;
    private final DlqEventRepository dlqEventRepository;
    private final MerchantWebhookConfigRepository merchantWebhookConfigRepository;
    private final ObjectMapper objectMapper;
    private final WebhookEventMapper webhookEventMapper;

    @Override
    @Transactional
    public void processOutboxEvent(OutboxEvent outboxEvent) {
        MerchantWebhookConfig config = merchantWebhookConfigRepository.findByMerchant_Id(outboxEvent.getMerchantId())
                .orElse(null);

        String targetUrl = (config != null && config.getTargetUrl() != null && !config.getTargetUrl().isBlank())
                ? config.getTargetUrl()
                : "https://api.merchant-domain.com/v1/webhook";

        String secret = (config != null && config.getWebhookSecretHash() != null)
                ? config.getWebhookSecretHash()
                : "whsec_default_secret";

        String signature = computeHmacSha256(outboxEvent.getPayload(), secret);
        Map<String, Object> payloadMap;
        try {
            payloadMap = objectMapper.readValue(outboxEvent.getPayload(), new TypeReference<>() {});
        } catch (Exception e) {
            payloadMap = Map.of("rawPayload", outboxEvent.getPayload());
        }

        WebhookEvent webhookEvent = WebhookEvent.builder()
                .merchantId(outboxEvent.getMerchantId())
                .eventType(outboxEvent.getEventType())
                .payload(payloadMap)
                .targetUrl(targetUrl)
                .signature(signature)
                .status(WebhookEventStatus.PENDING)
                .attempts(0)
                .build();

        webhookEvent = webhookEventRepository.save(webhookEvent);
        dispatch(webhookEvent);
    }

    @Override
    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void dispatchPendingWebhooks() {
        List<WebhookEvent> pendingList = webhookEventRepository
                .findByStatusAndNextRetryAtBefore(WebhookEventStatus.FAILED, LocalDateTime.now());

        for (WebhookEvent webhookEvent : pendingList) {
            dispatch(webhookEvent);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<WebhookEventResponse> getEventsByMerchant(UUID merchantId) {
        List<WebhookEvent> events = webhookEventRepository.findByMerchantId(merchantId);
        return webhookEventMapper.toResponseList(events);
    }

    private void dispatch(WebhookEvent webhookEvent) {
        webhookEvent.setAttempts(webhookEvent.getAttempts() + 1);
        webhookEvent.setLastAttemptAt(LocalDateTime.now());

        try {
            // Simulated HTTP dispatch to merchant webhook URL
            log.info("Simulating Webhook HTTP POST dispatch to {} for event {}", webhookEvent.getTargetUrl(), webhookEvent.getEventType());
            boolean success = true; // Simulating successful delivery

            if (success) {
                webhookEvent.setStatus(WebhookEventStatus.DELIVERED);
                webhookEvent.setLastResponseCode(200);
                webhookEvent.setLastResponseBody("OK");
                webhookEvent.setDeliveredAt(LocalDateTime.now());
            } else {
                handleFailure(webhookEvent, 500, "Simulated Webhook Delivery Failure");
            }
        } catch (Exception e) {
            handleFailure(webhookEvent, 500, e.getMessage());
        }

        webhookEventRepository.save(webhookEvent);
    }

    private void handleFailure(WebhookEvent webhookEvent, int responseCode, String errorMessage) {
        webhookEvent.setLastResponseCode(responseCode);
        webhookEvent.setLastResponseBody(errorMessage);

        if (webhookEvent.getAttempts() < 3) {
            webhookEvent.setStatus(WebhookEventStatus.FAILED);
            webhookEvent.setNextRetryAt(LocalDateTime.now().plusMinutes(5L * webhookEvent.getAttempts()));
        } else {
            webhookEvent.setStatus(WebhookEventStatus.DEAD);

            // Move to DLQ
            DlqEvent dlqEvent = DlqEvent.builder()
                    .merchantId(webhookEvent.getMerchantId())
                    .webhookEvent(webhookEvent)
                    .finalError(errorMessage)
                    .payload(webhookEvent.getPayload())
                    .movedAt(LocalDateTime.now())
                    .build();

            dlqEventRepository.save(dlqEvent);
            log.warn("Webhook event id: {} moved to DLQ after {} attempts", webhookEvent.getId(), webhookEvent.getAttempts());
        }
    }

    private String computeHmacSha256(String data, String secret) {
        if (secret == null || secret.isBlank()) return "UNSIGNED";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hmacBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to compute HMAC SHA256", e);
            return "ERROR";
        }
    }
}
