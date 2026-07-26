package com.dev.razorpay.payment.gateway;

import com.dev.razorpay.common.enums.PaymentMethod;
import com.dev.razorpay.payment.gateway.adapter.CardPaymentAdapter;
import com.dev.razorpay.payment.gateway.adapter.NetBankingAdapter;
import com.dev.razorpay.payment.gateway.adapter.UpiPaymentAdapter;
import com.dev.razorpay.payment.gateway.dto.PaymentRequest;
import com.dev.razorpay.payment.gateway.dto.PaymentResult;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

@Component
public class PaymentGatewayRouter {

    private final Map<PaymentMethod, PaymentAdapter> paymentAdapters = new EnumMap<>(PaymentMethod.class);

    public PaymentGatewayRouter(CardPaymentAdapter cardAdapter,
                                UpiPaymentAdapter upiAdapter,
                                NetBankingAdapter netBankingAdapter) {
        paymentAdapters.put(PaymentMethod.CARD, cardAdapter);
        paymentAdapters.put(PaymentMethod.UPI, upiAdapter);
        paymentAdapters.put(PaymentMethod.NETBANKING, netBankingAdapter);
    }

    public PaymentResult initiate(PaymentRequest request) {
        PaymentAdapter adapter = paymentAdapters.get(request.method());
        if (adapter == null) {
            throw new IllegalArgumentException("No payment adapter registered for method: " + request.method());
        }
        return adapter.initiate(request);
    }

    public PaymentResult capture(PaymentMethod method, UUID paymentId) {
        PaymentAdapter adapter = paymentAdapters.get(method);
        if (adapter == null) {
            throw new IllegalArgumentException("No payment adapter registered for method: " + method);
        }
        return adapter.capture(paymentId);
    }
}
