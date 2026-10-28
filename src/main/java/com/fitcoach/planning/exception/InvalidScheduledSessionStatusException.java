package com.fitcoach.planning.exception;

import com.fitcoach.common.exception.ConflictException;
import com.fitcoach.planning.domain.ScheduledSessionStatus;

public class InvalidScheduledSessionStatusException extends ConflictException {
    public InvalidScheduledSessionStatusException(ScheduledSessionStatus from, ScheduledSessionStatus to) {
        super("Une seance au statut " + from + " ne peut pas passer au statut " + to + ".");
    }
}
