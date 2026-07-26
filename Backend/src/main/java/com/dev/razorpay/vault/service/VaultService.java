package com.dev.razorpay.vault.service;

import com.dev.razorpay.common.entity.Money;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorResponse;
import com.dev.razorpay.vault.dto.request.TokenizeRequest;
import com.dev.razorpay.vault.dto.response.TokenizeResponse;
import org.springframework.lang.Nullable;

import java.util.Map;
import java.util.UUID;

public interface VaultService {

    TokenizeResponse tokenize(TokenizeRequest request, UUID merchantId);

    PaymentProcessorResponse charge(UUID paymentId, String token, Money amount, Map<String, Object> methodDetails);
}
