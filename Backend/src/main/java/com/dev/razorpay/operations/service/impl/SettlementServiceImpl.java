package com.dev.razorpay.operations.service.impl;

import com.dev.razorpay.common.entity.Money;
import com.dev.razorpay.common.enums.PaymentStatus;
import com.dev.razorpay.common.enums.SettlementStatus;
import com.dev.razorpay.common.util.RandomizerUtil;
import com.dev.razorpay.operations.dto.response.SettlementResponse;
import com.dev.razorpay.operations.entity.Settlement;
import com.dev.razorpay.operations.entity.SettlementPayment;
import com.dev.razorpay.operations.entity.SettlementPaymentId;
import com.dev.razorpay.operations.mapper.SettlementMapper;
import com.dev.razorpay.operations.repository.SettlementPaymentRepository;
import com.dev.razorpay.operations.repository.SettlementRepository;
import com.dev.razorpay.operations.service.SettlementService;
import com.dev.razorpay.payment.entity.Payment;
import com.dev.razorpay.payment.entity.Refund;
import com.dev.razorpay.payment.repository.PaymentRepository;
import com.dev.razorpay.payment.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementServiceImpl implements SettlementService {

    private final SettlementRepository settlementRepository;
    private final SettlementPaymentRepository settlementPaymentRepository;
    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final SettlementMapper settlementMapper;

    @Override
    @Scheduled(cron = "0 0 1 * * *") // Daily at 1 AM
    @Transactional
    public void runDailySettlements() {
        log.info("Starting daily settlement processing batch job");

        List<Payment> eligiblePayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.CAPTURED || 
                            p.getStatus() == PaymentStatus.PARTIALLY_REFUNDED)
                .filter(p -> !settlementPaymentRepository.existsById_PaymentId(p.getId()))
                .collect(Collectors.toList());

        if (eligiblePayments.isEmpty()) {
            log.info("No eligible payments available for settlement");
            return;
        }

        Map<UUID, List<Payment>> paymentsByMerchant = eligiblePayments.stream()
                .collect(Collectors.groupingBy(Payment::getMerchantId));

        for (Map.Entry<UUID, List<Payment>> entry : paymentsByMerchant.entrySet()) {
            UUID merchantId = entry.getKey();
            List<Payment> merchantPayments = entry.getValue();

            int grossUnits = merchantPayments.stream()
                    .mapToInt(p -> p.getAmount().getAmountUnits())
                    .sum();

            // Calculate total refunded amount for these payments
            int totalRefundedUnits = 0;
            for (Payment payment : merchantPayments) {
                List<Refund> paymentRefunds = refundRepository.findByPayment_Id(payment.getId());
                totalRefundedUnits += paymentRefunds.stream()
                        .filter(r -> r.getStatus() == com.dev.razorpay.common.enums.RefundStatus.PROCESSED)
                        .mapToInt(r -> r.getAmount().getAmountUnits())
                        .sum();
            }

            String currency = merchantPayments.get(0).getAmount().getCurrency();

            // Net amount after refunds for fee calculation
            int netGrossUnits = grossUnits - totalRefundedUnits;
            
            // Calculate fees only on the net amount (after refunds)
            int feeUnits = (int) Math.round(netGrossUnits * 0.02);
            int gstUnits = (int) Math.round(feeUnits * 0.18);
            int finalNetUnits = netGrossUnits - (feeUnits + gstUnits);

            Settlement settlement = Settlement.builder()
                    .merchantId(merchantId)
                    .grossAmount(Money.of(grossUnits, currency))
                    .refundAmount(Money.of(totalRefundedUnits, currency))
                    .feeAmount(Money.of(feeUnits, currency))
                    .gstAmount(Money.of(gstUnits, currency))
                    .netAmount(Money.of(finalNetUnits, currency))
                    .status(SettlementStatus.PROCESSED)
                    .bankReference("SETTL_" + RandomizerUtil.randomBase64(10))
                    .processedAt(LocalDateTime.now())
                    .build();

            settlement = settlementRepository.save(settlement);

            for (Payment p : merchantPayments) {
                SettlementPaymentId spId = new SettlementPaymentId(settlement.getId(), p.getId());
                SettlementPayment sp = SettlementPayment.builder()
                        .id(spId)
                        .settlement(settlement)
                        .build();
                settlementPaymentRepository.save(sp);

                p.setStatus(PaymentStatus.SETTLED);
                p.setSettledAt(LocalDateTime.now());
                paymentRepository.save(p);
            }

            log.info("Settlement completed for merchantId: {}, gross: {}, refunds: {}, net: {}", 
                    merchantId, grossUnits, totalRefundedUnits, finalNetUnits);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SettlementResponse> getSettlementsByMerchant(UUID merchantId) {
        List<Settlement> settlements = settlementRepository.findByMerchantId(merchantId);
        return settlementMapper.toResponseList(settlements);
    }
}
