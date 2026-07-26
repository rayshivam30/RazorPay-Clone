package com.dev.razorpay.payment.service;

import com.dev.razorpay.payment.dto.request.RefundRequest;
import com.dev.razorpay.payment.dto.response.RefundResponse;

import java.util.List;
import java.util.UUID;

public interface RefundService {

    RefundResponse createRefund(UUID merchantId, RefundRequest request);

    RefundResponse getRefundById(UUID merchantId, UUID refundId);

    List<RefundResponse> listRefundsByPayment(UUID merchantId, UUID paymentId);

    List<RefundResponse> listRefundsByMerchant(UUID merchantId);
}
