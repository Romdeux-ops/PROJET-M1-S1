package com.fitcoach.program.exception;

public class CannotRateOwnProgramException extends RuntimeException {
    public CannotRateOwnProgramException() {
        super("Vous ne pouvez pas noter votre propre programme.");
    }
}
