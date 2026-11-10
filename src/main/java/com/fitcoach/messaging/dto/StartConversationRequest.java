package com.fitcoach.messaging.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/** {@code counterpartId} : le coach (si l'appelant est athlete) ou l'athlete (s'il est coach). */
public record StartConversationRequest(@NotNull UUID counterpartId) {}
