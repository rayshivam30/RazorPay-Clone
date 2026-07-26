package com.dev.razorpay.merchant.dto.response;

import com.dev.razorpay.common.enums.BusinessType;
import com.dev.razorpay.common.enums.MerchantStatus;
import lombok.Data;

import java.util.UUID;

public record MerchantResponse(
        UUID id,
        String name,
        String email,
        String businessName,
        BusinessType businessType,
        MerchantStatus merchantStatus
) {
}
