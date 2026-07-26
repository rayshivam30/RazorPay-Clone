package com.dev.razorpay.payment.gateway.adapter;

import com.dev.razorpay.common.util.RandomizerUtil;
import com.dev.razorpay.payment.gateway.PaymentAdapter;
import com.dev.razorpay.payment.gateway.dto.PaymentRequest;
import com.dev.razorpay.payment.gateway.dto.PaymentResult;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorResponse;
import com.dev.razorpay.vault.dto.request.TokenizeRequest;
import com.dev.razorpay.vault.dto.response.TokenizeResponse;
import com.dev.razorpay.vault.service.VaultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@RequiredArgsConstructor
@Component
@Slf4j
public class CardPaymentAdapter implements PaymentAdapter {

    private final VaultService vaultService;

    @Override
    public PaymentResult initiate(PaymentRequest request) {
        String token = (String) request.methodDetails().get("token");

        if (token == null || token.isBlank()) {
            String pan = (String) request.methodDetails().getOrDefault("pan", request.methodDetails().get("cardNumber"));
            String cvv = (String) request.methodDetails().getOrDefault("cvv", "123");
            String expiryMonthStr = String.valueOf(request.methodDetails().getOrDefault("expiryMonth", "11"));
            String expiryYearStr = String.valueOf(request.methodDetails().getOrDefault("expiryYear", "2028"));
            String cardHolderName = (String) request.methodDetails().getOrDefault("cardHolderName", "Cardholder");

            if (pan != null && !pan.isBlank()) {
                try {
                    int mm = Integer.parseInt(expiryMonthStr);
                    int yy = Integer.parseInt(expiryYearStr);
                    TokenizeResponse tokRes = vaultService.tokenize(
                            new TokenizeRequest(pan, cvv, mm, yy, request.merchantId(), cardHolderName),
                            request.merchantId()
                    );
                    token = tokRes.token();
                } catch (Exception e) {
                    log.warn("Tokenization failed for new card, using fallback token: {}", e.getMessage());
                    token = "tok_sim_" + RandomizerUtil.randomBase64(16);
                }
            } else {
                token = "tok_sim_" + RandomizerUtil.randomBase64(16);
            }
        }

        PaymentProcessorResponse response = vaultService.charge(
                request.paymentId(), token, request.amount(), request.methodDetails()
        );

        return switch (response) {
            case PaymentProcessorResponse.Success success -> new PaymentResult.Success(success.bankReference());
            case PaymentProcessorResponse.Failure failure -> new PaymentResult.Failure(failure.errorCode(), failure.errorDescription());
            case PaymentProcessorResponse.Pending pending -> new PaymentResult.Pending(pending.processorReference());
        };
    }

    @Override
    public PaymentResult capture(UUID paymentId) {
        return new PaymentResult.Success("CARD_REF");
    }
}
