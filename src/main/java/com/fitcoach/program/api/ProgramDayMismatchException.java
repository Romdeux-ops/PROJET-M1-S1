package com.fitcoach.program.api;

import com.fitcoach.common.exception.BusinessRuleException;

public class ProgramDayMismatchException extends BusinessRuleException {
    public ProgramDayMismatchException() {
        super("Le jour indique n'appartient pas au programme choisi.");
    }
}
