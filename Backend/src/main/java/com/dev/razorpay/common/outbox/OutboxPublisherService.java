package com.dev.razorpay.common.outbox;

import com.dev.razorpay.common.entity.OutboxEvent;
import com.dev.razorpay.common.repository.OutboxEventRepository;
import com.dev.razorpay.operations.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisherService {

    private final OutboxEventRepository outboxEventRepository;
    private final WebhookService webhookService;

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
        if (pendingEvents.isEmpty()) return;

        log.info("Processing {} outbox events", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                webhookService.processOutboxEvent(event);
                event.setStatus("PUBLISHED");
                event.setProcessedAt(LocalDateTime.now());
            } catch (Exception e) {
                log.error("Failed to process outbox event id: {}", event.getId(), e);
                event.setStatus("FAILED");
            }
        }

        outboxEventRepository.saveAll(pendingEvents);
    }
}
