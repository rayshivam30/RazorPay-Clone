package com.dev.razorpay.payment.service;

import com.dev.razorpay.payment.dto.request.PaymentInitRequest;
import com.dev.razorpay.payment.dto.response.PaymentResponse;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.UUID;

public interface PaymentService {

    PaymentResponse initiate(UUID merchantId, PaymentInitRequest request);

    PaymentResponse capture(UUID merchantId, UUID paymentId);

    PaymentResponse getById(UUID merchantId, UUID paymentId);

    List<PaymentResponse> listPayments(UUID merchantId);

    void resolveAuthorization(UUID paymentId, boolean approve, String bankRef, String errorCode, String errorDescription);
}
