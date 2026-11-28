package com.fitcoach.messaging.exception;

import com.fitcoach.common.exception.ForbiddenException;

public class NotActiveRelationException extends ForbiddenException {
    public NotActiveRelationException() {
        super("La messagerie n'est ouverte qu'entre un coach et un athlete qu'il suit activement, ou apres un match FitMatch.");
    }
}
