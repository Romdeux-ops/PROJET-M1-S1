package com.fitcoach.identity.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidBodyWeightException
        extends BusinessRuleException {

    public InvalidBodyWeightException(String message) {
        super(message);
    }
}