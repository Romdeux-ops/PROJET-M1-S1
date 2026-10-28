package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.ForbiddenException;

/** Levee quand un coach tente de modifier ou supprimer la publication d'un autre coach. */
public class NotPostAuthorException extends ForbiddenException {

    public NotPostAuthorException() {
        super("Seul l'auteur peut modifier ou supprimer cette publication.");
    }
}
