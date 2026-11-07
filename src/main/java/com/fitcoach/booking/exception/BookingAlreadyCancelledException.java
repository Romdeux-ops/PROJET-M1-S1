package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.ConflictException;

public class BookingAlreadyCancelledException extends ConflictException {
    public BookingAlreadyCancelledException() {
        super("Cette reservation est deja annulee.");
    }
}
