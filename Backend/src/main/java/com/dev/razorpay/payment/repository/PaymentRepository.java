package com.dev.razorpay.payment.repository;

import com.dev.razorpay.common.enums.PaymentStatus;
import com.dev.razorpay.payment.entity.OrderRecord;
import com.dev.razorpay.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByOrder_Id(OrderRecord order);

    Optional<Payment> findByIdAndMerchantId(UUID paymentId, UUID merchantId);

    List<Payment> findByMerchantId(UUID merchantId);

    List<Payment> findByStatusAndCreatedAtBefore(PaymentStatus paymentStatus, LocalDateTime globalWindow);
}
