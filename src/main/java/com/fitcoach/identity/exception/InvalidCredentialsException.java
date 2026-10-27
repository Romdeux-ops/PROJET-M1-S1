package com.fitcoach.identity.exception;

import com.fitcoach.common.exception.UnauthorizedException;

public class InvalidCredentialsException extends UnauthorizedException {

    public InvalidCredentialsException() {
        super("E-mail ou mot de passe incorrect.");
    }
}
