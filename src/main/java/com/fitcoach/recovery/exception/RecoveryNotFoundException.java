package com.fitcoach.recovery.exception;

import com.fitcoach.common.exception.NotFoundException;

public class RecoveryNotFoundException extends NotFoundException {

    public RecoveryNotFoundException(String message) {
        super(message);
    }
}