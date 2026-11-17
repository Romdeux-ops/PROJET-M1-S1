package com.fitcoach.notification.api;

import java.util.UUID;

/** Point d'entree des autres modules pour emettre une notification a un utilisateur. */
public interface Notifier {

    /**
     * Cree la notification sauf si {@code dedupeKey} existe deja pour ce destinataire.
     *
     * @param link route frontend a ouvrir au clic, ou {@code null}
     * @param dedupeKey cle d'idempotence, ou {@code null} pour une notification ponctuelle
     * @return vrai si la notification vient d'etre creee
     */
    boolean notify(UUID userId, NotificationType type, String title, String body, String link, String dedupeKey);
}
