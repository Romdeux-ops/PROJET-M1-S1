package com.fitcoach.identity.api;

import com.fitcoach.common.exception.NotFoundException;

public class UserNotFoundException extends NotFoundException {

    public UserNotFoundException() {
        super("Utilisateur introuvable.");
    }
}
