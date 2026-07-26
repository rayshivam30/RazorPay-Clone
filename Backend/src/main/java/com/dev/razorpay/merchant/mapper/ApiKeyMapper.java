package com.dev.razorpay.merchant.mapper;

import com.dev.razorpay.merchant.dto.response.ApiKeyCreateResponse;
import com.dev.razorpay.merchant.dto.response.ApiKeyResponse;
import com.dev.razorpay.merchant.entity.ApiKey;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ApiKeyMapper {

    ApiKeyCreateResponse toCreateResponse(ApiKey apiKey);

    List<ApiKeyResponse> toResponseList(List<ApiKey> apiKeyList);
}
