package com.fitcoach.coaching.exception;

/** Levee quand l'email fourni ne correspond a aucun compte avec le role ATHLETE. */
public class InvalidAthleteException extends RuntimeException {

    public InvalidAthleteException(String message) {
        super(message);
    }
}
