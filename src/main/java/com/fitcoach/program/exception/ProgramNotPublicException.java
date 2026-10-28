package com.fitcoach.program.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class ProgramNotPublicException extends BusinessRuleException {
    public ProgramNotPublicException() {
        super("Seuls les programmes publics peuvent etre notes.");
    }
}
