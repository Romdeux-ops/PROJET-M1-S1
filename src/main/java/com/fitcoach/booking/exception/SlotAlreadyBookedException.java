package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.ConflictException;

public class SlotAlreadyBookedException extends ConflictException {
    public SlotAlreadyBookedException() {
        super("Ce creneau vient d'etre reserve par un autre athlete.");
    }
}
