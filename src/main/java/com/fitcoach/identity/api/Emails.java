package com.fitcoach.identity.api;

import java.util.Locale;

/**
 * Forme canonique d'une adresse e-mail : sans espaces de bord et en minuscules.
 *
 * <p>La colonne {@code users.email} est en {@code citext}, mais Hibernate lie le
 * parametre en {@code varchar} et PostgreSQL compare alors en tenant compte de la
 * casse : chaque adresse qui entre ou qui sert de critere de recherche passe donc
 * par ici.
 */
public final class Emails {

    private Emails() {}

    public static String normalize(String email) {
        return email == null ? null : email.strip().toLowerCase(Locale.ROOT);
    }
}
