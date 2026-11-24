package com.fitcoach.coaching.dto;

/** Reglages du profil public tels que le coach les voit (desactive tant qu'il ne l'a pas publie). */
public record PublicProfileSettingsResponse(boolean enabled, String headline, String bio) {}
