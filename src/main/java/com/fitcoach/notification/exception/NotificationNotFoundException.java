package com.fitcoach.notification.exception;

import com.fitcoach.common.exception.NotFoundException;

public class NotificationNotFoundException extends NotFoundException {
    public NotificationNotFoundException() {
        super("Notification introuvable.");
    }
}
