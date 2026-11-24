package com.fitcoach.identity.api;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Point d'entree des autres modules vers les comptes utilisateurs. */
public interface UserDirectory {

    Optional<UserSummary> findById(UUID userId);

    /** Les identifiants inconnus sont simplement absents de la map. */
    Map<UUID, UserSummary> findAllById(Collection<UUID> userIds);

    Optional<UserSummary> findByEmail(String email);

    /** Preference « notifications activees » ; vrai pour un compte inconnu (rien a couper). */
    boolean notificationsEnabled(UUID userId);
}
