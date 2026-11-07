package com.fitcoach.booking.dto;

import com.fitcoach.booking.domain.Booking;
import com.fitcoach.booking.domain.BookingStatus;
import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID slotId,
        UUID coachId,
        String coachName,
        UUID athleteId,
        String athleteName,
        Instant startsAt,
        Instant endsAt,
        BookingStatus status,
        String note,
        Instant cancellationDeadline,
        Instant cancelledAt,
        UUID cancelledBy) {

    public static BookingResponse from(Booking booking, String coachName, String athleteName) {
        return new BookingResponse(
                booking.getId(),
                booking.getSlotId(),
                booking.getCoachId(),
                coachName,
                booking.getAthleteId(),
                athleteName,
                booking.getStartsAt(),
                booking.getEndsAt(),
                booking.getStatus(),
                booking.getNote(),
                booking.getCancellationDeadline(),
                booking.getCancelledAt(),
                booking.getCancelledBy());
    }
}
