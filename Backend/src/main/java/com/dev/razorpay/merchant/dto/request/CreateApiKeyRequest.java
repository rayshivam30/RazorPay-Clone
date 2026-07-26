package com.dev.razorpay.merchant.dto.request;

import com.dev.razorpay.common.enums.Environment;

public record CreateApiKeyRequest(
        Environment environment
) {
}
