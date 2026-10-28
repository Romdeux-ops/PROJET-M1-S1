package com.fitcoach.coaching.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** {@code POST /api/coaching/athletes} : rattache un athlete existant par email. */
public record AddAthleteRequest(@NotBlank @Email String athleteEmail) {}
