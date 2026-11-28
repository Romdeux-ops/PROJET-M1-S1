package com.fitcoach.matching.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class AgeRequirementException extends BusinessRuleException {
    public AgeRequirementException(int minimumAge) {
        super("FitMatch est reserve aux personnes de " + minimumAge
                + " ans ou plus : renseignez une date de naissance valide.");
    }
}
