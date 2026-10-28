package com.fitcoach.planning.exception;

import com.fitcoach.common.exception.NotFoundException;

public class UnknownWorkoutSessionException extends NotFoundException {
    public UnknownWorkoutSessionException() {
        super("Seance introuvable.");
    }
}
