package com.fitcoach.program.exception;

public class ProgramDayNotFoundException extends RuntimeException {
    public ProgramDayNotFoundException() {
        super("Jour de programme introuvable.");
    }
}
