package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.ConflictException;

public class SlotHasBookingException extends ConflictException {
    public SlotHasBookingException() {
        super("Ce creneau est reserve : annulez d'abord la reservation.");
    }
}
