package com.fitcoach.identity.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("E-mail ou mot de passe incorrect.");
    }
}
