package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.NotFoundException;

public class SlotNotFoundException extends NotFoundException {
    public SlotNotFoundException() {
        super("Creneau introuvable.");
    }
}
