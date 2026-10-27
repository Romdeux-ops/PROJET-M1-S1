package com.fitcoach.identity.exception;

import com.fitcoach.common.exception.ConflictException;

public class EmailAlreadyUsedException extends ConflictException {

    public EmailAlreadyUsedException(String email) {
        super("Un compte existe deja avec l'adresse " + email);
    }
}
