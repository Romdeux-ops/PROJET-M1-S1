package com.fitcoach.planning.exception;

public class NotValidatingCoachException extends RuntimeException {
    public NotValidatingCoachException() {
        super("Seul un coach actif de cet athlete peut valider cette seance.");
    }
}
