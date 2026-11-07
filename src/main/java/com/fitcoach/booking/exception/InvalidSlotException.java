package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidSlotException extends BusinessRuleException {
    public InvalidSlotException(String message) {
        super(message);
    }
}
