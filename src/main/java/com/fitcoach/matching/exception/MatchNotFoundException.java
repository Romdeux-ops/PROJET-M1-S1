package com.fitcoach.matching.exception;

import com.fitcoach.common.exception.NotFoundException;

public class MatchNotFoundException extends NotFoundException {
    public MatchNotFoundException() {
        super("Match introuvable.");
    }
}
