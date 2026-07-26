package com.dev.razorpay.payment.controller;

import com.dev.razorpay.merchant.security.MerchantContext;
import com.dev.razorpay.payment.dto.request.RefundRequest;
import com.dev.razorpay.payment.dto.response.RefundResponse;
import com.dev.razorpay.payment.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;
    private final MerchantContext merchantContext;

    @PostMapping("/payments/{paymentId}/refunds")
    public ResponseEntity<RefundResponse> createRefund(
            @PathVariable UUID paymentId,
            @Valid @RequestBody RefundRequest request) {
        // Ensure request has matching paymentId
        RefundRequest refundRequest = new RefundRequest(paymentId, request.amount(), request.reason(), request.notes());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(refundService.createRefund(merchantContext.getMerchantId(), refundRequest));
    }

    @GetMapping("/refunds/{refundId}")
    public ResponseEntity<RefundResponse> getRefundById(@PathVariable UUID refundId) {
        return ResponseEntity.ok(refundService.getRefundById(merchantContext.getMerchantId(), refundId));
    }

    @GetMapping("/payments/{paymentId}/refunds")
    public ResponseEntity<List<RefundResponse>> listRefundsByPayment(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(refundService.listRefundsByPayment(merchantContext.getMerchantId(), paymentId));
    }

    @GetMapping("/refunds")
    public ResponseEntity<List<RefundResponse>> listRefundsByMerchant() {
        return ResponseEntity.ok(refundService.listRefundsByMerchant(merchantContext.getMerchantId()));
    }
}
