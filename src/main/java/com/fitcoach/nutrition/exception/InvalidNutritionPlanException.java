package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidNutritionPlanException extends BusinessRuleException {

    public InvalidNutritionPlanException(String message) {
        super(message);
    }
}