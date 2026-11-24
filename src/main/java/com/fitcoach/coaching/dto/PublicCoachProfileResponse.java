package com.fitcoach.coaching.dto;

import java.util.UUID;

/** Ce qu'un visiteur voit d'un coach ayant rendu son profil public : jamais l'e-mail. */
public record PublicCoachProfileResponse(
        UUID id,
        String firstName,
        String lastName,
        String avatarUrl,
        String headline,
        String bio,
        ViewerStatus viewerStatus) {}
