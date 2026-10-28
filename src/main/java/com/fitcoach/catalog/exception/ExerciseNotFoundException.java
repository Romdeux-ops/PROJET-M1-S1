package com.fitcoach.catalog.exception;

import com.fitcoach.common.exception.NotFoundException;

public class ExerciseNotFoundException extends NotFoundException {
    public ExerciseNotFoundException() {
        super("Exercice introuvable.");
    }
}
