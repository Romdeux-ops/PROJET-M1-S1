package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.ConflictException;

/** Levee quand une invitation est envoyee a un athlete deja suivi ou deja invite. */
public class InvitationConflictException extends ConflictException {

    public InvitationConflictException(String message) {
        super(message);
    }
}
