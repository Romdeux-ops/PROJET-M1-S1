package com.fitcoach.planning.exception;

public class ScheduledSessionNotFoundException extends RuntimeException {
    public ScheduledSessionNotFoundException() {
        super("Seance planifiee introuvable.");
    }
}
