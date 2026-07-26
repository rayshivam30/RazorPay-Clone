package com.dev.razorpay.payment.mapper;

import com.dev.razorpay.payment.dto.response.RefundResponse;
import com.dev.razorpay.payment.entity.Refund;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RefundMapper {

    @Mapping(target = "paymentId", source = "payment.id")
    RefundResponse toResponse(Refund refund);

    @Mapping(target = "paymentId", source = "payment.id")
    List<RefundResponse> toResponseList(List<Refund> refundList);
}
