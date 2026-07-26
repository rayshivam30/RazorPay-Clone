package com.dev.razorpay.operations.controller;

import com.dev.razorpay.merchant.security.MerchantContext;
import com.dev.razorpay.operations.dto.response.SettlementResponse;
import com.dev.razorpay.operations.dto.response.WebhookEventResponse;
import com.dev.razorpay.operations.service.SettlementService;
import com.dev.razorpay.operations.service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final WebhookService webhookService;
    private final SettlementService settlementService;
    private final MerchantContext merchantContext;

    @GetMapping("/webhooks")
    public ResponseEntity<List<WebhookEventResponse>> getWebhookEvents() {
        return ResponseEntity.ok(webhookService.getEventsByMerchant(merchantContext.getMerchantId()));
    }

    @GetMapping("/settlements")
    public ResponseEntity<List<SettlementResponse>> getSettlements() {
        return ResponseEntity.ok(settlementService.getSettlementsByMerchant(merchantContext.getMerchantId()));
    }

    @PostMapping("/settlements/trigger")
    public ResponseEntity<String> triggerSettlements() {
        settlementService.runDailySettlements();
        return ResponseEntity.ok("Settlement processing triggered successfully");
    }
}
