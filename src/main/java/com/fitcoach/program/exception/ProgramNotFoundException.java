package com.fitcoach.program.exception;

import com.fitcoach.common.exception.NotFoundException;

public class ProgramNotFoundException extends NotFoundException {
    public ProgramNotFoundException() {
        super("Programme introuvable.");
    }
}
