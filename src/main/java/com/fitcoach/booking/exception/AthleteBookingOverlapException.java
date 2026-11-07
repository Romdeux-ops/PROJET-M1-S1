package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.ConflictException;

public class AthleteBookingOverlapException extends ConflictException {
    public AthleteBookingOverlapException() {
        super("Vous avez deja une reservation sur cet horaire.");
    }
}
