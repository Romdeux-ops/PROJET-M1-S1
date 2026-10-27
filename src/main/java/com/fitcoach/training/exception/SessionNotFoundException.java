package com.fitcoach.training.exception;

import com.fitcoach.common.exception.NotFoundException;

public class SessionNotFoundException extends NotFoundException {
    public SessionNotFoundException() {
        super("Seance introuvable.");
    }
}
