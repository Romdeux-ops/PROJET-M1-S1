package com.fitcoach.training.exception;

public class SessionNotFoundException extends RuntimeException {
    public SessionNotFoundException() {
        super("Seance introuvable.");
    }
}
