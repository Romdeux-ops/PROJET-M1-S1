package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.ForbiddenException;

/** Levee quand un utilisateur consulte les publications d'un coach dont il n'est ni le client actif ni l'auteur. */
public class NotCoachClientException extends ForbiddenException {

    public NotCoachClientException() {
        super("Vous devez etre suivi par ce coach pour voir ses publications.");
    }
}
