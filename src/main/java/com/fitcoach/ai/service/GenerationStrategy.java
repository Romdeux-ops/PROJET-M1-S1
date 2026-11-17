package com.fitcoach.ai.service;

import java.util.Locale;

/** Choix du generateur : {@code auto} prend Claude si une cle d'API est fournie, sinon les regles. */
public enum GenerationStrategy {
    AUTO,
    RULES,
    CLAUDE;

    public static GenerationStrategy parse(String value) {
        if (value == null || value.isBlank()) {
            return AUTO;
        }
        return valueOf(value.strip().toUpperCase(Locale.ROOT));
    }
}
