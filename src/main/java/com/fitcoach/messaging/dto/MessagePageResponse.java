package com.fitcoach.messaging.dto;

import java.util.List;
import java.util.UUID;

/**
 * Page d'historique, plus recent d'abord. {@code nextCursor} est a passer en
 * {@code before} pour obtenir les messages plus anciens ; nul en fin d'historique.
 */
public record MessagePageResponse(List<MessageResponse> items, UUID nextCursor) {}
