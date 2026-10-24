package com.fitcoach.coaching.exception;

/** Levee quand un utilisateur sans role COACH appelle une route reservee aux coachs. */
public class NotCoachException extends RuntimeException {

    public NotCoachException() {
        super("Cette action est reservee aux coachs.");
    }
}
