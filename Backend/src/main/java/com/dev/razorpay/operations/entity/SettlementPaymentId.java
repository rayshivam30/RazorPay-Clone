package com.dev.razorpay.operations.entity;

import jakarta.persistence.Embeddable;

import java.util.UUID;

import lombok.*;

@Embeddable
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class SettlementPaymentId {

    private UUID settlementId;

    private UUID paymentId;
}
