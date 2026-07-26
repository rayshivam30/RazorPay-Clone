package com.dev.razorpay.payment.processor;

import com.dev.razorpay.common.enums.PaymentMethod;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorRequest;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorResponse;
import com.dev.razorpay.payment.processor.strategy.CardPaymentProcessor;
import com.dev.razorpay.payment.processor.strategy.NetBankingPaymentProcessor;
import com.dev.razorpay.payment.processor.strategy.UpiPaymentProcessor;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class PaymentProcessorRouter {

    private final Map<PaymentMethod, PaymentProcessor> paymentProcessors = new EnumMap<>(PaymentMethod.class);

    public PaymentProcessorRouter(CardPaymentProcessor cardProcessor,
                                 UpiPaymentProcessor upiProcessor,
                                 NetBankingPaymentProcessor netBankingProcessor) {
        paymentProcessors.put(PaymentMethod.CARD, cardProcessor);
        paymentProcessors.put(PaymentMethod.UPI, upiProcessor);
        paymentProcessors.put(PaymentMethod.NETBANKING, netBankingProcessor);
    }

    public PaymentProcessorResponse charge(PaymentProcessorRequest request) {
        PaymentProcessor processor = paymentProcessors.get(request.method());
        if (processor == null) {
            throw new IllegalArgumentException("No payment processor registered for method: " + request.method());
        }
        return processor.charge(request);
    }
}
