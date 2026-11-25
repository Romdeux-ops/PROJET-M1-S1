package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidMealLogException extends BusinessRuleException {

    public InvalidMealLogException(String message) {
        super(message);
    }
}