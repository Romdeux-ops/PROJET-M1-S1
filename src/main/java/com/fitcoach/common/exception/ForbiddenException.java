package com.fitcoach.common.exception;

/** Base pour tout refus d'acces metier (403). */
public abstract class ForbiddenException extends RuntimeException {
    protected ForbiddenException(String message) {
        super(message);
    }
}
