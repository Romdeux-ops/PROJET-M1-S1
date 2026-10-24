package com.fitcoach.identity.exception;

public class EmailAlreadyUsedException extends RuntimeException {

    public EmailAlreadyUsedException(String email) {
        super("Un compte existe deja avec l'adresse " + email);
    }
}
