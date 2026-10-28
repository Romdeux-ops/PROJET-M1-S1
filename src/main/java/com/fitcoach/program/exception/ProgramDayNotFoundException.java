package com.fitcoach.program.exception;

import com.fitcoach.common.exception.NotFoundException;

public class ProgramDayNotFoundException extends NotFoundException {
    public ProgramDayNotFoundException() {
        super("Jour de programme introuvable.");
    }
}
