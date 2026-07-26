package com.dev.razorpay.payment.service.impl;

import com.dev.razorpay.common.enums.OrderStatus;
import com.dev.razorpay.common.exception.BusinessRuleViolationException;
import com.dev.razorpay.common.exception.DuplicateResourceException;
import com.dev.razorpay.common.exception.ResourceNotFoundException;
import com.dev.razorpay.payment.dto.request.CreateOrderRequest;
import com.dev.razorpay.payment.dto.response.OrderResponse;
import com.dev.razorpay.payment.dto.response.PaymentResponse;
import com.dev.razorpay.payment.entity.OrderRecord;
import com.dev.razorpay.payment.entity.Payment;
import com.dev.razorpay.payment.mapper.OrderMapper;
import com.dev.razorpay.payment.mapper.PaymentMapper;
import com.dev.razorpay.payment.repository.OrderRepository;
import com.dev.razorpay.payment.repository.PaymentRepository;
import com.dev.razorpay.payment.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.dev.razorpay.common.entity.OutboxEvent;
import com.dev.razorpay.common.repository.OutboxEventRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final OrderMapper orderMapper;
    private final OutboxEventRepository outboxEventRepository;

    @Value("${payment.order.default-order-expiry-minutes:30}")
    private int defaultOrderExpiryMinutes;

    @Override
    @Transactional
    public OrderResponse create(UUID merchantId, CreateOrderRequest request) {
        if (request.receipt() != null && orderRepository.existsByMerchantIdAndReceipt(merchantId, request.receipt())) {
            throw new DuplicateResourceException("ORDER_RECEIPT_DUPLICATE", "Order with receipt already exists: " + request.receipt());
        }

        OrderRecord order = OrderRecord.builder()
                .receipt(request.receipt())
                .amount(request.amount())
                .notes(request.notes())

                .merchantId(merchantId)
                .orderStatus(OrderStatus.CREATED)
                .expiresAt(request.expiresAt() != null ? request.expiresAt() :
                        LocalDateTime.now().plusMinutes(defaultOrderExpiryMinutes))
                .build();

        order = orderRepository.save(order);

        outboxEventRepository.save(OutboxEvent.builder()
                .aggregateType("ORDER")
                .aggregateId(order.getId().toString())
                .eventType("order.created")
                .merchantId(merchantId)
                .payload("{\"orderId\":\"" + order.getId() + "\",\"amount\":" + order.getAmount().getAmountUnits() + "}")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build());

        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse getById(UUID merchantId, UUID orderId) {
        OrderRecord order = orderRepository.findByIdAndMerchantId(orderId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancel(UUID merchantId, UUID orderId) {
        OrderRecord order = orderRepository.findByIdAndMerchantId(orderId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if(order.getOrderStatus() == OrderStatus.CANCELLED || order.getOrderStatus() == OrderStatus.PAID) {
            throw new BusinessRuleViolationException("ORDER_CANNOT_CANCEL",
                    "Cannot cancel order with status: "+order.getOrderStatus().name());
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        return orderMapper.toResponse(order);
    }

    @Override
    public List<PaymentResponse> listPayments(UUID merchantId, UUID orderId) {
        OrderRecord order = orderRepository.findByIdAndMerchantId(orderId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        List<Payment> paymentList = paymentRepository.findByOrder_Id(order);

//        return paymentList.stream().map(
//                payment -> paymentMapper.toResponse(payment)
//        ).collect(Collectors.toList());

        return paymentMapper.toResponseList(paymentList);
    }
}
