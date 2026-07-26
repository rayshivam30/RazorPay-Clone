package com.dev.razorpay.operations.service;

import com.dev.razorpay.operations.dto.response.SettlementResponse;

import java.util.List;
import java.util.UUID;

public interface SettlementService {

    void runDailySettlements();

    List<SettlementResponse> getSettlementsByMerchant(UUID merchantId);
}
