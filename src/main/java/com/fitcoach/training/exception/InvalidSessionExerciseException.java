package com.fitcoach.training.exception;

public class InvalidSessionExerciseException extends RuntimeException {
    public InvalidSessionExerciseException() {
        super("L'exercice reference n'existe pas dans le catalogue.");
    }
}
