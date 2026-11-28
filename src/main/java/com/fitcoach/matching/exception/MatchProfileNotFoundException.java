package com.fitcoach.matching.exception;

import com.fitcoach.common.exception.NotFoundException;

public class MatchProfileNotFoundException extends NotFoundException {
    public MatchProfileNotFoundException() {
        super("Profil FitMatch introuvable.");
    }
}
