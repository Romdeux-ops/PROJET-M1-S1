package com.fitcoach.common.exception;

/** Base pour toute violation d'une regle metier (400). */
public abstract class BusinessRuleException extends RuntimeException {
    protected BusinessRuleException(String message) {
        super(message);
    }
}
