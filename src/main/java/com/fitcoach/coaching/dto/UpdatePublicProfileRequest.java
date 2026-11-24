package com.fitcoach.coaching.dto;

import jakarta.validation.constraints.Size;

/** {@code PUT /api/coaching/public-profile} : publie ou masque le profil et en regle le texte. */
public record UpdatePublicProfileRequest(
        boolean enabled,
        @Size(max = 120, message = "120 caracteres maximum") String headline,
        @Size(max = 1000, message = "1000 caracteres maximum") String bio) {}
