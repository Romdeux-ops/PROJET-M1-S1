package com.fitcoach.training.exception;

import com.fitcoach.common.exception.NotFoundException;

public class SessionSetNotFoundException extends NotFoundException {
    public SessionSetNotFoundException() {
        super("Serie introuvable.");
    }
}
