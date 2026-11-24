package com.fitcoach.training.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class SessionInFutureException extends BusinessRuleException {
    public SessionInFutureException() {
        super("Une seance realisee ne peut pas etre datee dans le futur.");
    }
}
