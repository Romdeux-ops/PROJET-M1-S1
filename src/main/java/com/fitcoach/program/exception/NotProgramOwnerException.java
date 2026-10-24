package com.fitcoach.program.exception;

public class NotProgramOwnerException extends RuntimeException {
    public NotProgramOwnerException() {
        super("Seul le proprietaire du programme peut effectuer cette action.");
    }
}
