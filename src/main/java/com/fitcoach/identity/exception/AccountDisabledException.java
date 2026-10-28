package com.fitcoach.identity.exception;

import com.fitcoach.common.exception.ForbiddenException;

public class AccountDisabledException extends ForbiddenException {

    public AccountDisabledException() {
        super("Ce compte est suspendu ou desactive.");
    }
}
