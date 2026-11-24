package com.fitcoach.program.api;

import com.fitcoach.common.exception.NotFoundException;

/** Programme inconnu ou invisible : meme reponse dans les deux cas pour ne pas reveler son existence. */
public class UnusableProgramException extends NotFoundException {
    public UnusableProgramException() {
        super("Programme introuvable.");
    }
}
