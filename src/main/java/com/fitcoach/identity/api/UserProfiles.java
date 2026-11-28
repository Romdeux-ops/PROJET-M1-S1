package com.fitcoach.identity.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/** Point d'entree des autres modules vers les donnees de profil d'un compte. */
public interface UserProfiles {

    /** @throws UserNotFoundException si le compte n'existe pas */
    ProfileSnapshot get(UUID userId);

    /** Les identifiants inconnus sont simplement absents de la map. */
    Map<UUID, ProfileSnapshot> findAll(Collection<UUID> userIds);

    /**
     * Complete le profil avec les valeurs non nulles fournies, sans toucher aux
     * autres. Les valeurs doivent avoir ete validees par l'appelant.
     *
     * @throws UserNotFoundException si le compte n'existe pas
     */
    ProfileSnapshot complete(UUID userId, LocalDate birthDate, BigDecimal heightCm);
}
