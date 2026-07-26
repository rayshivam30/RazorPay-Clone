package com.dev.razorpay.operations.mapper;

import com.dev.razorpay.operations.dto.response.SettlementResponse;
import com.dev.razorpay.operations.entity.Settlement;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SettlementMapper {

    SettlementResponse toResponse(Settlement settlement);

    List<SettlementResponse> toResponseList(List<Settlement> settlements);
}
