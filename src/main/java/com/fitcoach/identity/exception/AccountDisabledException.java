package com.fitcoach.identity.exception;

public class AccountDisabledException extends RuntimeException {

    public AccountDisabledException() {
        super("Ce compte est suspendu ou desactive.");
    }
}
