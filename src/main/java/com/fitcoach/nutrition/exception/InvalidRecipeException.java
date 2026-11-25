package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidRecipeException extends BusinessRuleException {

    public InvalidRecipeException(String message) {
        super(message);
    }
}