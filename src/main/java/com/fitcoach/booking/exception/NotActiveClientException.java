package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.ForbiddenException;

public class NotActiveClientException extends ForbiddenException {
    public NotActiveClientException() {
        super("Seuls les athletes suivis par ce coach peuvent reserver ses creneaux.");
    }
}
