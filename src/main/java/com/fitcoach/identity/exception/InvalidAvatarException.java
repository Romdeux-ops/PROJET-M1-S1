package com.fitcoach.identity.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidAvatarException extends BusinessRuleException {

    public InvalidAvatarException(String message) {
        super(message);
    }
}
