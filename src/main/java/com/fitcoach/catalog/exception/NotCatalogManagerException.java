package com.fitcoach.catalog.exception;

public class NotCatalogManagerException extends RuntimeException {
    public NotCatalogManagerException() {
        super("Seuls les coachs et administrateurs peuvent gerer le catalogue d'exercices.");
    }
}
