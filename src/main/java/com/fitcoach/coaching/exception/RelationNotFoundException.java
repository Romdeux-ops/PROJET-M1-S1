package com.fitcoach.coaching.exception;

import com.fitcoach.common.exception.NotFoundException;

/** Levee quand l'invitation ou la relation visee n'existe pas, ou n'est pas dans l'etat attendu. */
public class RelationNotFoundException extends NotFoundException {

    public RelationNotFoundException() {
        super("Invitation ou relation introuvable.");
    }
}
