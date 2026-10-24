package com.fitcoach.catalog.exception;

public class ExerciseNotFoundException extends RuntimeException {
    public ExerciseNotFoundException() {
        super("Exercice introuvable.");
    }
}
