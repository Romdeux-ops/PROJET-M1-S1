package com.fitcoach.common.exception;

public class InvalidReorderException extends BusinessRuleException {
    public InvalidReorderException() {
        super("L'ordre fourni doit contenir exactement une fois chaque element de la liste.");
    }
}
