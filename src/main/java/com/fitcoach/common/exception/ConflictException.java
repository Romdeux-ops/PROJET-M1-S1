package com.fitcoach.common.exception;

/** Base pour tout conflit d'etat metier (409). */
public abstract class ConflictException extends RuntimeException {
    protected ConflictException(String message) {
        super(message);
    }
}
