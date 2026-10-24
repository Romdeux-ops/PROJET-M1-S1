package com.fitcoach.program.exception;

public class ProgramNotFoundException extends RuntimeException {
    public ProgramNotFoundException() {
        super("Programme introuvable.");
    }
}
