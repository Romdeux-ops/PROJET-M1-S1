package com.fitcoach.identity.dto;

/** Reponse commune a login et register (frontend: {@code AuthResponse}). */
public record AuthResponse(String accessToken, UserResponse user) {}
