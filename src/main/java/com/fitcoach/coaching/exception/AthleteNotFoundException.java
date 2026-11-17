package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.NotFoundException;

/** Levee quand l'athlete n'est pas un client actif du coach : meme reponse qu'un athlete inexistant. */
public class AthleteNotFoundException extends NotFoundException {

    public AthleteNotFoundException() {
        super("Athlete introuvable parmi vos clients.");
    }
}
