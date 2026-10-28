package com.fitcoach.program.exception;

import com.fitcoach.common.exception.ForbiddenException;

public class NotProgramOwnerException extends ForbiddenException {
    public NotProgramOwnerException() {
        super("Seul le proprietaire du programme peut effectuer cette action.");
    }
}
