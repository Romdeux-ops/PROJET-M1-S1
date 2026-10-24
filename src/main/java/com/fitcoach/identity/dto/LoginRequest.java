package com.fitcoach.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** {@code POST /api/auth/login}. */
public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
