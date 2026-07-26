package com.dev.razorpay.merchant.controller;

import com.dev.razorpay.merchant.dto.request.LoginRequest;
import com.dev.razorpay.merchant.dto.request.MerchantSignupRequest;
import com.dev.razorpay.merchant.dto.response.LoginResponse;
import com.dev.razorpay.merchant.dto.response.MerchantResponse;
import com.dev.razorpay.merchant.security.MerchantContext;
import com.dev.razorpay.merchant.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MerchantContext merchantContext;

    @PostMapping("/signup")
    public ResponseEntity<MerchantResponse> signup(@RequestBody @Valid MerchantSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                authService.signup(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(
                authService.login(request)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<MerchantResponse> me() {
        return ResponseEntity.ok(authService.getMerchantById(merchantContext.getMerchantId()));
    }

}
