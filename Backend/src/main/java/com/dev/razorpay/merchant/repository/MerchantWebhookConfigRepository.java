package com.dev.razorpay.merchant.repository;

import com.dev.razorpay.merchant.entity.MerchantWebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MerchantWebhookConfigRepository extends JpaRepository<MerchantWebhookConfig, UUID> {
    Optional<MerchantWebhookConfig> findByMerchant_Id(UUID merchantId);
}
