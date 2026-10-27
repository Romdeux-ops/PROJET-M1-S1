package com.fitcoach.planning.exception;

import com.fitcoach.common.exception.NotFoundException;

public class ScheduledSessionNotFoundException extends NotFoundException {
    public ScheduledSessionNotFoundException() {
        super("Seance planifiee introuvable.");
    }
}
