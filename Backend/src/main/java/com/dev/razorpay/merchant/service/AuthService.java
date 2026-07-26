package com.dev.razorpay.merchant.service;

import com.dev.razorpay.merchant.dto.request.LoginRequest;
import com.dev.razorpay.merchant.dto.request.MerchantSignupRequest;
import com.dev.razorpay.merchant.dto.response.LoginResponse;
import com.dev.razorpay.merchant.dto.response.MerchantResponse;

import java.util.UUID;

public interface AuthService {
    MerchantResponse signup(MerchantSignupRequest request);

    LoginResponse login(LoginRequest request);

    MerchantResponse getMerchantById(UUID merchantId);
}
