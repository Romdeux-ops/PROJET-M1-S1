package com.fitcoach.identity.dto;

import com.fitcoach.identity.api.UserSummary;

/** Reponse commune a login et register (frontend: {@code AuthResponse}). */
public record AuthResponse(String accessToken, UserSummary user) {}
