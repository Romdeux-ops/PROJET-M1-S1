package com.fitcoach.booking.dto;

import com.fitcoach.booking.domain.AvailabilitySlot;
import com.fitcoach.booking.domain.Booking;
import java.time.Instant;
import java.util.UUID;

/** Les champs {@code booking*} et {@code athlete*} sont nuls tant que le creneau est libre. */
public record SlotResponse(
        UUID id,
        UUID coachId,
        String coachName,
        Instant startsAt,
        Instant endsAt,
        UUID bookingId,
        UUID athleteId,
        String athleteName,
        String bookingNote) {

    public static SlotResponse free(AvailabilitySlot slot, String coachName) {
        return new SlotResponse(
                slot.getId(), slot.getCoachId(), coachName, slot.getStartsAt(), slot.getEndsAt(), null, null, null, null);
    }

    public static SlotResponse booked(AvailabilitySlot slot, String coachName, Booking booking, String athleteName) {
        return new SlotResponse(
                slot.getId(),
                slot.getCoachId(),
                coachName,
                slot.getStartsAt(),
                slot.getEndsAt(),
                booking.getId(),
                booking.getAthleteId(),
                athleteName,
                booking.getNote());
    }
}
