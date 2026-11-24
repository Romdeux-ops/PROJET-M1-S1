package com.fitcoach.program.exception;

import com.fitcoach.common.exception.ForbiddenException;

/** Levee quand un utilisateur sans role COACH ou ADMIN choisit la visibilite CLIENTS. */
public class ClientsVisibilityNotAllowedException extends ForbiddenException {

    public ClientsVisibilityNotAllowedException() {
        super("Seuls les coachs peuvent partager un programme avec leurs athletes.");
    }
}
