package com.dev.razorpay.payment.service.impl;

import com.dev.razorpay.common.enums.OrderStatus;
import com.dev.razorpay.common.enums.PaymentEvent;
import com.dev.razorpay.common.enums.PaymentMethod;
import com.dev.razorpay.common.enums.PaymentStatus;
import com.dev.razorpay.common.exception.BusinessRuleViolationException;
import com.dev.razorpay.common.exception.ResourceNotFoundException;
import com.dev.razorpay.payment.dto.request.PaymentInitRequest;
import com.dev.razorpay.payment.dto.response.PaymentResponse;
import com.dev.razorpay.payment.entity.OrderRecord;
import com.dev.razorpay.payment.entity.Payment;
import com.dev.razorpay.payment.gateway.PaymentGatewayRouter;
import com.dev.razorpay.payment.gateway.dto.PaymentRequest;
import com.dev.razorpay.payment.gateway.dto.PaymentResult;
import com.dev.razorpay.payment.mapper.PaymentMapper;
import com.dev.razorpay.payment.repository.OrderRepository;
import com.dev.razorpay.payment.repository.PaymentRepository;
import com.dev.razorpay.payment.service.PaymentService;
import com.dev.razorpay.payment.statemachine.PaymentTransitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.dev.razorpay.common.entity.OutboxEvent;
import com.dev.razorpay.common.repository.OutboxEventRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentGatewayRouter paymentGatewayRouter;
    private final PaymentMapper paymentMapper;
    private final PaymentTransitionService paymentTransitionService;
    private final OutboxEventRepository outboxEventRepository;

    @Override
    @Transactional()
    public PaymentResponse initiate(UUID merchantId, PaymentInitRequest request) {
        OrderRecord order = orderRepository.findByIdAndMerchantId(request.orderId(), merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.orderId()));

        if(order.getOrderStatus() != OrderStatus.CREATED && order.getOrderStatus() != OrderStatus.ATTEMPTED) {
            throw new BusinessRuleViolationException("ORDER_NOT_PAYABLE",
                    "Order cannot accept payment in status: "+order.getOrderStatus());
        }

        order.setOrderStatus(OrderStatus.ATTEMPTED);
        order.setAttempts(order.getAttempts()+1);

        Payment payment = Payment.builder()
                .order(order)
                .merchantId(merchantId)
                .amount(order.getAmount())
                .status(PaymentStatus.CREATED)
                .method(request.method())
                .idempotencyKey(UUID.randomUUID().toString()) //TODO: idempotency
                .methodDetails(request.methodDetails())
                .build();
        payment = paymentRepository.save(payment);

        PaymentRequest paymentRequest = new PaymentRequest(payment.getId(),
                request.orderId(), merchantId,
                order.getAmount(), request.method(),
                request.methodDetails());

        paymentTransitionService.apply(payment, PaymentEvent.AUTHORIZE_ATTEMPT);
        PaymentResult result = paymentGatewayRouter.initiate(paymentRequest);

        switch (result) {
            case PaymentResult.Pending pending -> payment.setProcessorReference(pending.registrationRef());
            case PaymentResult.Failure failure -> {
//                payment.setStatus(PaymentStatus.FAILED);
                paymentTransitionService.apply(payment, PaymentEvent.AUTHORIZE_FAIL);
                payment.setErrorCode(failure.errorCode());
                payment.setErrorDescription(failure.errorDescription());
            }
            case PaymentResult.Success success -> {
                log.warn("Invalid state");
                return null;
            }
        }

        payment = paymentRepository.save(payment);
        orderRepository.save(order);

        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("PAYMENT")
                .aggregateId(payment.getId().toString())
                .eventType("payment.initiated")
                .merchantId(merchantId)
                .payload("{\"paymentId\":\"" + payment.getId() + "\",\"status\":\"" + payment.getStatus() + "\"}")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());

        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse capture(UUID merchantId, UUID paymentId) {

        Payment payment = paymentRepository.findByIdAndMerchantId(paymentId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        paymentTransitionService.apply(payment, PaymentEvent.CAPTURE_REQUEST);

        PaymentResult paymentResult = paymentGatewayRouter.capture(payment.getMethod(), paymentId);

        if(paymentResult instanceof  PaymentResult.Success success) {
            paymentTransitionService.apply(payment, PaymentEvent.CAPTURE_SUCCESS);
            payment.setCapturedAt(LocalDateTime.now());
            log.info("Payment captured, paymentID: {}", paymentId);
        } else if(paymentResult instanceof  PaymentResult.Failure failure) {
            paymentTransitionService.apply(payment, PaymentEvent.CAPTURE_FAIL);
            payment.setErrorCode(failure.errorCode());
            payment.setErrorDescription(failure.errorDescription());
            log.warn("Payment capture failed, paymentID: {}", paymentId);
        }

        payment = paymentRepository.save(payment);

        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("PAYMENT")
                .aggregateId(payment.getId().toString())
                .eventType(payment.getStatus() == PaymentStatus.CAPTURED ? "payment.captured" : "payment.failed")
                .merchantId(merchantId)
                .payload("{\"paymentId\":\"" + payment.getId() + "\",\"status\":\"" + payment.getStatus() + "\"}")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());

        return paymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse getById(UUID merchantId, UUID paymentId) {
        Payment payment = paymentRepository.findByIdAndMerchantId(paymentId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        return paymentMapper.toResponse(payment);
    }

    @Override
    public List<PaymentResponse> listPayments(UUID merchantId) {
        List<Payment> payments = paymentRepository.findByMerchantId(merchantId);
        return paymentMapper.toResponseList(payments);
    }

    @Override
    @Transactional
    public void resolveAuthorization(UUID paymentId, boolean approve,
                                     String bankRef, String errorCode, String errorDescription) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() != PaymentStatus.AUTHORIZING) {
            log.warn("Payment is not in Authorizing state, paymentID: {}, status: {}", paymentId, payment.getStatus());
            return;
        }

        OrderRecord orderRecord = payment.getOrder();

        if (approve) {
            paymentTransitionService.apply(payment, PaymentEvent.AUTHORIZE_SUCCESS);
            payment.setBankReference(bankRef);
            payment.setAuthorizedAt(LocalDateTime.now());

            // Auto-capture
            paymentTransitionService.apply(payment, PaymentEvent.CAPTURE_REQUEST);
            PaymentResult captureResult = paymentGatewayRouter.capture(payment.getMethod(), paymentId);

            if(captureResult instanceof PaymentResult.Success success) {
                paymentTransitionService.apply(payment, PaymentEvent.CAPTURE_SUCCESS);
                payment.setCapturedAt(LocalDateTime.now());
                orderRecord.setOrderStatus(OrderStatus.PAID);
            } else if (captureResult instanceof  PaymentResult.Failure failure){
                paymentTransitionService.apply(payment, PaymentEvent.CAPTURE_FAIL);
                payment.setErrorCode(failure.errorCode());
                payment.setErrorDescription(failure.errorDescription());
            }
        } else {
            paymentTransitionService.apply(payment, PaymentEvent.AUTHORIZE_FAIL);
            payment.setErrorCode(errorCode);
            payment.setErrorDescription(errorDescription);
        }

        paymentRepository.save(payment);
        orderRepository.save(orderRecord);

        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("PAYMENT")
                .aggregateId(payment.getId().toString())
                .eventType(payment.getStatus() == PaymentStatus.CAPTURED ? "payment.captured" : "payment.failed")
                .merchantId(payment.getMerchantId())
                .payload("{\"paymentId\":\"" + payment.getId() + "\",\"status\":\"" + payment.getStatus() + "\"}")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());
    }
}

// open for extension
// closed for modification












