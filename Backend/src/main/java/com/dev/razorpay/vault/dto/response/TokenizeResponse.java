package com.dev.razorpay.vault.dto.response;

import com.dev.razorpay.common.enums.CardBrand;

public record TokenizeResponse(
        String token,
        String lastFour,
        CardBrand brand,
        Integer expiryMonth,
        Integer expiryYear,
        String cardHolderName
) {
}
