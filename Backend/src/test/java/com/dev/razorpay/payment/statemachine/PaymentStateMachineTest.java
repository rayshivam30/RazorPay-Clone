package com.dev.razorpay.payment.statemachine;

import com.dev.razorpay.common.enums.PaymentEvent;
import com.dev.razorpay.common.enums.PaymentStatus;
import com.dev.razorpay.common.exception.InvalidStateTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentStateMachineTest {

    private PaymentStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new PaymentStateMachine();
    }

    @Test
    void testValidTransitions() {
        assertEquals(PaymentStatus.AUTHORIZING, stateMachine.transition(PaymentStatus.CREATED, PaymentEvent.AUTHORIZE_ATTEMPT));
        assertEquals(PaymentStatus.AUTHORIZED, stateMachine.transition(PaymentStatus.AUTHORIZING, PaymentEvent.AUTHORIZE_SUCCESS));
        assertEquals(PaymentStatus.CAPTURING, stateMachine.transition(PaymentStatus.AUTHORIZED, PaymentEvent.CAPTURE_REQUEST));
        assertEquals(PaymentStatus.CAPTURED, stateMachine.transition(PaymentStatus.CAPTURING, PaymentEvent.CAPTURE_SUCCESS));
    }

    @Test
    void testAuthorizeFailureTransition() {
        assertEquals(PaymentStatus.FAILED, stateMachine.transition(PaymentStatus.AUTHORIZING, PaymentEvent.AUTHORIZE_FAIL));
    }

    @Test
    void testInvalidTransitionThrowsException() {
        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.transition(PaymentStatus.CREATED, PaymentEvent.CAPTURE_SUCCESS));
    }
}
