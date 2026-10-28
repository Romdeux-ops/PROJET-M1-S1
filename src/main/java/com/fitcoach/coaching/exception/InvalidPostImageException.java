package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidPostImageException extends BusinessRuleException {

    public InvalidPostImageException(String message) {
        super(message);
    }
}
