package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.ConflictException;

public class SlotOverlapException extends ConflictException {
    public SlotOverlapException() {
        super("Ce creneau chevauche un de vos creneaux existants.");
    }
}
