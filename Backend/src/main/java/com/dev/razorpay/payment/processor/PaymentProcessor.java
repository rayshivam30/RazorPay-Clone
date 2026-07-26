package com.dev.razorpay.payment.processor;

import com.dev.razorpay.payment.processor.dto.PaymentProcessorRequest;
import com.dev.razorpay.payment.processor.dto.PaymentProcessorResponse;

public interface PaymentProcessor {

    PaymentProcessorResponse charge(PaymentProcessorRequest request);

}
