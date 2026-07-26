package com.dev.razorpay.payment.mapper;

import com.dev.razorpay.payment.dto.response.PaymentResponse;
import com.dev.razorpay.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "bankReference", source = "bankReference")
    @Mapping(target = "errorMessage", source = "errorDescription")
    @Mapping(target = "capturedAt", source = "capturedAt")
    @Mapping(target = "refundedAt", source = "refundedAt")
    @Mapping(target = "settledAt", source = "settledAt")
    PaymentResponse toResponse(Payment payment);

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "bankReference", source = "bankReference")
    @Mapping(target = "errorMessage", source = "errorDescription")
    @Mapping(target = "capturedAt", source = "capturedAt")
    @Mapping(target = "refundedAt", source = "refundedAt")
    @Mapping(target = "settledAt", source = "settledAt")
    List<PaymentResponse> toResponseList(List<Payment> paymentList);

}
