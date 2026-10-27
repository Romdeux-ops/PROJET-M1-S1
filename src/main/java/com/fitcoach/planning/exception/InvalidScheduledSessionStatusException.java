package com.fitcoach.planning.exception;

import com.fitcoach.common.exception.ConflictException;

public class InvalidScheduledSessionStatusException extends ConflictException {
    public InvalidScheduledSessionStatusException(String message) {
        super(message);
    }
}
