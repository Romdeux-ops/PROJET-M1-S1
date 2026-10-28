package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.ForbiddenException;

/** Levee quand un utilisateur sans role COACH appelle une route reservee aux coachs. */
public class NotCoachException extends ForbiddenException {

    public NotCoachException() {
        super("Cette action est reservee aux coachs.");
    }
}
