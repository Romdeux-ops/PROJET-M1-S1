package com.fitcoach.recovery.exception;

import com.fitcoach.common.exception.ConflictException;

public class RecoveryConflictException extends ConflictException {

    public RecoveryConflictException(String message) {
        super(message);
    }
}