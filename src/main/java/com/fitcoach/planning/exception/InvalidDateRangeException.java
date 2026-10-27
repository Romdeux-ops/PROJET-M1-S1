package com.fitcoach.planning.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidDateRangeException extends BusinessRuleException {
    public InvalidDateRangeException(int maxDays) {
        super("La periode doit commencer avant de finir et couvrir au plus " + maxDays + " jours.");
    }
}
