package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.NotFoundException;

public class BookingNotFoundException extends NotFoundException {
    public BookingNotFoundException() {
        super("Reservation introuvable.");
    }
}
