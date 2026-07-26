package com.dev.razorpay.operations.repository;

import com.dev.razorpay.operations.entity.DlqEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DlqEventRepository extends JpaRepository<DlqEvent, UUID> {
    List<DlqEvent> findByMerchantId(UUID merchantId);
}
