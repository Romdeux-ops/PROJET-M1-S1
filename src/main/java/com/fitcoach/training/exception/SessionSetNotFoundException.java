package com.fitcoach.training.exception;

public class SessionSetNotFoundException extends RuntimeException {
    public SessionSetNotFoundException() {
        super("Serie introuvable.");
    }
}
