package com.fitcoach.program.exception;

import com.fitcoach.common.exception.NotFoundException;

public class ProgramExerciseNotFoundException extends NotFoundException {
    public ProgramExerciseNotFoundException() {
        super("Exercice de programme introuvable.");
    }
}
