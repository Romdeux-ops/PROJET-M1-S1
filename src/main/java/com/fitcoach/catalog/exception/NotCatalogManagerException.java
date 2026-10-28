package com.fitcoach.catalog.exception;

import com.fitcoach.common.exception.ForbiddenException;

public class NotCatalogManagerException extends ForbiddenException {
    public NotCatalogManagerException() {
        super("Seuls les coachs et administrateurs peuvent gerer le catalogue d'exercices.");
    }

    public NotCatalogManagerException(String message) {
        super(message);
    }
}
