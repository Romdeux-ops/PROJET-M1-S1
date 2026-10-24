package com.fitcoach.program.exception;

public class ProgramNotPublicException extends RuntimeException {
    public ProgramNotPublicException() {
        super("Seuls les programmes publics peuvent etre notes.");
    }
}
