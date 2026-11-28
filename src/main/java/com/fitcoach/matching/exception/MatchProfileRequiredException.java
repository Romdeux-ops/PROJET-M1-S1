package com.fitcoach.matching.exception;

import com.fitcoach.common.exception.ConflictException;

public class MatchProfileRequiredException extends ConflictException {
    public MatchProfileRequiredException() {
        super("Creez d'abord votre profil FitMatch.");
    }
}
