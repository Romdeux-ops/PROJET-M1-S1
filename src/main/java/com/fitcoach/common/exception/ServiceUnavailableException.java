package com.fitcoach.common.exception;

/** Base pour un service externe indisponible ou non configure (503). */
public abstract class ServiceUnavailableException extends RuntimeException {
    protected ServiceUnavailableException(String message) {
        super(message);
    }
}
