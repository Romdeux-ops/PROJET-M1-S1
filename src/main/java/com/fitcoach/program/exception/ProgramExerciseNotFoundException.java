package com.fitcoach.program.exception;

public class ProgramExerciseNotFoundException extends RuntimeException {
    public ProgramExerciseNotFoundException() {
        super("Exercice de programme introuvable.");
    }
}
