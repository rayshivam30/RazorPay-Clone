package com.dev.razorpay.payment.repository;

import com.dev.razorpay.payment.entity.Payment;
import com.dev.razorpay.payment.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefundRepository extends JpaRepository<Refund, UUID> {
    List<Refund> findByPayment_Id(UUID paymentId);

    List<Refund> findByMerchantId(UUID merchantId);

    Optional<Refund> findByIdAndMerchantId(UUID refundId, UUID merchantId);
}
