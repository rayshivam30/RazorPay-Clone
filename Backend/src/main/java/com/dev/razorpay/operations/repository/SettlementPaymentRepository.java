package com.dev.razorpay.operations.repository;

import com.dev.razorpay.operations.entity.SettlementPayment;
import com.dev.razorpay.operations.entity.SettlementPaymentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SettlementPaymentRepository extends JpaRepository<SettlementPayment, SettlementPaymentId> {
    List<SettlementPayment> findBySettlement_Id(UUID settlementId);
    boolean existsById_PaymentId(UUID paymentId);
}
