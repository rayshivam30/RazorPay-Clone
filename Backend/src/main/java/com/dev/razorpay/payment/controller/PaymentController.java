package com.dev.razorpay.payment.controller;

import com.dev.razorpay.merchant.security.MerchantContext;
import com.dev.razorpay.payment.dto.request.PaymentInitRequest;
import com.dev.razorpay.payment.dto.response.PaymentResponse;
import com.dev.razorpay.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/v1/payments")
@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final MerchantContext merchantContext;

    @PostMapping
    public ResponseEntity<PaymentResponse> initiate(@Valid @RequestBody PaymentInitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.initiate(merchantContext.getMerchantId(), request));
    }

    @PostMapping("/{paymentId}/capture")
    public ResponseEntity<PaymentResponse> capture(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(paymentService.capture(merchantContext.getMerchantId(), paymentId));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getById(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(paymentService.getById(merchantContext.getMerchantId(), paymentId));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> listPayments() {
        return ResponseEntity.ok(paymentService.listPayments(merchantContext.getMerchantId()));
    }
}
