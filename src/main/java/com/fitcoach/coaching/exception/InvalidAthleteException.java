package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.BusinessRuleException;

/** Levee quand l'email fourni ne correspond a aucun compte avec le role ATHLETE. */
public class InvalidAthleteException extends BusinessRuleException {

    public InvalidAthleteException(String message) {
        super(message);
    }
}
