package com.fitcoach.common.exception;

/** Base pour tout echec d'authentification (401). */
public abstract class UnauthorizedException extends RuntimeException {
    protected UnauthorizedException(String message) {
        super(message);
    }
}
