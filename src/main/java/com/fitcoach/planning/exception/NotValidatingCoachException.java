package com.fitcoach.planning.exception;

import com.fitcoach.common.exception.ForbiddenException;

public class NotValidatingCoachException extends ForbiddenException {
    public NotValidatingCoachException() {
        super("Seul un coach actif de cet athlete peut valider cette seance.");
    }
}
