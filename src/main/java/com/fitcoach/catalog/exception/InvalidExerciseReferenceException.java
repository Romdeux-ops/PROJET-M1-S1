package com.fitcoach.catalog.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidExerciseReferenceException extends BusinessRuleException {
    public InvalidExerciseReferenceException(String message) {
        super(message);
    }
}
