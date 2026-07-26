package com.dev.razorpay.payment.processor.strategy;

import com.dev.razorpay.common.util.RandomizerUtil;
import com.dev.razorpay.payment.processor.PaymentProcessor;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorRequest;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorResponse;
import org.springframework.stereotype.Component;

@Component
public class NetBankingPaymentProcessor implements PaymentProcessor {

    @Override
    public PaymentProcessorResponse charge(PaymentProcessorRequest request) {

        final String BANK_CODE_FAIL = "BANK_CODE_FAIL";

        String bankCode = null;
        if (request.methodDetails() != null) {
            Object bankObj = request.methodDetails().get("bank");
            if (bankObj == null) bankObj = request.methodDetails().get("bankCode");
            if (bankObj != null) bankCode = bankObj.toString();
        }

        // simulation
        if (BANK_CODE_FAIL.equals(bankCode)) {
            return new PaymentProcessorResponse.Failure("BANK_REJECTED",
                    "Bank rejected the transaction registration"
            );
        }

        String processorRef = "NBK_PROCESSOR_" + RandomizerUtil.randomBase64(16);

        return new PaymentProcessorResponse.Pending(processorRef);
    }
}
