package com.fitcoach.messaging.exception;

import com.fitcoach.common.exception.NotFoundException;

public class ConversationNotFoundException extends NotFoundException {
    public ConversationNotFoundException() {
        super("Conversation introuvable.");
    }
}
