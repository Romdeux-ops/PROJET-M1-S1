package com.fitcoach.messaging.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidPageRequestException extends BusinessRuleException {
    public InvalidPageRequestException(String message) {
        super(message);
    }
}
