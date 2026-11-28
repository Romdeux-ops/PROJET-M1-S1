package com.fitcoach.identity.api;

import com.fitcoach.common.security.RoleCode;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Donnees sportives d'un compte exposees aux autres modules : ce que le profil
 * sait deja (prenom, date de naissance, taille, objectif, niveau) et qu'un
 * module comme FitMatch reutilise sans le recopier.
 */
public record ProfileSnapshot(
        UUID id,
        String firstName,
        String avatarUrl,
        List<RoleCode> roles,
        LocalDate birthDate,
        BigDecimal heightCm,
        String fitnessGoal,
        String experienceLevel,
        boolean active) {

    public boolean hasRole(RoleCode role) {
        return roles.contains(role);
    }
}
