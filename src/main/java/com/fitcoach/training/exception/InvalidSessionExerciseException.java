package com.fitcoach.training.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidSessionExerciseException extends BusinessRuleException {
    public InvalidSessionExerciseException() {
        super("L'exercice reference n'existe pas dans le catalogue.");
    }
}
