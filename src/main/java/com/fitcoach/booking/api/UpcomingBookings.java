package com.fitcoach.booking.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Point d'entree des autres modules vers les reservations a venir. */
public interface UpcomingBookings {

    /** Reservations {@code CONFIRMED} dont le debut est dans {@code [from, to)}, les plus proches d'abord. */
    List<UpcomingBooking> confirmedStartingBetween(Instant from, Instant to);

    record UpcomingBooking(UUID id, UUID coachId, UUID athleteId, Instant startsAt) {}
}
