package com.fitcoach.program.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class CannotRateOwnProgramException extends BusinessRuleException {
    public CannotRateOwnProgramException() {
        super("Vous ne pouvez pas noter votre propre programme.");
    }
}
