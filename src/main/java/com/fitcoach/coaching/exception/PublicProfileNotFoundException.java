package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.NotFoundException;

/** Levee quand le profil public demande n'existe pas, n'est pas celui d'un coach ou n'a pas ete rendu public. */
public class PublicProfileNotFoundException extends NotFoundException {

    public PublicProfileNotFoundException() {
        super("Ce profil n'est pas disponible.");
    }
}
