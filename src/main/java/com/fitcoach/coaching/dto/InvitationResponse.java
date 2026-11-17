package com.fitcoach.coaching.dto;

import com.fitcoach.identity.api.UserSummary;
import java.time.Instant;

/** Invitation en attente : le coach qui invite, l'athlete invite et la date d'envoi. */
public record InvitationResponse(UserSummary coach, UserSummary athlete, Instant invitedAt) {}
