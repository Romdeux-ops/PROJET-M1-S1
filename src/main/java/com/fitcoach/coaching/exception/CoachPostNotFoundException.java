package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.NotFoundException;

public class CoachPostNotFoundException extends NotFoundException {
    public CoachPostNotFoundException() {
        super("Publication introuvable.");
    }
}
