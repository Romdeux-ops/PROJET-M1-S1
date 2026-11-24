package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.NotFoundException;

public class CoachNoteNotFoundException extends NotFoundException {

    public CoachNoteNotFoundException() {
        super("Note introuvable.");
    }
}
