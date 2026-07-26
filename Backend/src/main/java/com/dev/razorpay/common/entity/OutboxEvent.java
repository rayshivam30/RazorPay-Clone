package com.dev.razorpay.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "outbox_events")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String aggregateType; // e.g. PAYMENT, ORDER, REFUND

    @Column(nullable = false)
    private String aggregateId;

    @Column(nullable = false, length = 100)
    private String eventType; // e.g. payment.authorized, payment.captured, payment.failed, order.created

    @Column(nullable = false)
    private UUID merchantId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String payload; // JSON representation of the event payload

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, PUBLISHED, FAILED

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;
}
