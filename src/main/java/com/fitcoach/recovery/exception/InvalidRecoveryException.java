package com.fitcoach.recovery.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidRecoveryException extends BusinessRuleException {

    public InvalidRecoveryException(String message) {
        super(message);
    }
}