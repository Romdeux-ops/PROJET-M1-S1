package com.fitcoach.common.exception;

/** Base pour toute ressource metier introuvable (404). */
public abstract class NotFoundException extends RuntimeException {
    protected NotFoundException(String message) {
        super(message);
    }
}
