package com.fitcoach.coaching.exception;

/** Levee quand un coach tente de modifier ou supprimer la publication d'un autre coach. */
public class NotPostAuthorException extends RuntimeException {

    public NotPostAuthorException() {
        super("Seul l'auteur peut modifier ou supprimer cette publication.");
    }
}
