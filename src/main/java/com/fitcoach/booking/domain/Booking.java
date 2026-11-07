package com.fitcoach.booking.domain;

import com.fitcoach.booking.exception.BookingAlreadyCancelledException;
import com.fitcoach.booking.exception.CancellationTooLateException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Reservation d'un creneau par un athlete (table {@code bookings}, V9).
 *
 * <p>Confirmee des sa creation, annulable par l'athlete ou le coach tant que
 * le debut du creneau est a plus de {@link #CANCELLATION_NOTICE}.
 */
@Entity
@Table(name = "bookings")
public class Booking {

    public static final Duration CANCELLATION_NOTICE = Duration.ofHours(24);

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "slot_id", nullable = false)
    private UUID slotId;

    @Column(name = "coach_id", nullable = false)
    private UUID coachId;

    @Column(name = "athlete_id", nullable = false)
    private UUID athleteId;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.CONFIRMED;

    private String note;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancelled_by")
    private UUID cancelledBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected Booking() {
        // JPA
    }

    public Booking(AvailabilitySlot slot, UUID athleteId, String note) {
        this.slotId = slot.getId();
        this.coachId = slot.getCoachId();
        this.athleteId = athleteId;
        this.startsAt = slot.getStartsAt();
        this.endsAt = slot.getEndsAt();
        this.note = note;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSlotId() {
        return slotId;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public UUID getAthleteId() {
        return athleteId;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public String getNote() {
        return note;
    }

    public Instant getCancelledAt() {
        return cancelledAt;
    }

    public UUID getCancelledBy() {
        return cancelledBy;
    }

    public Instant getCancellationDeadline() {
        return startsAt.minus(CANCELLATION_NOTICE);
    }

    public boolean involves(UUID userId) {
        return athleteId.equals(userId) || coachId.equals(userId);
    }

    public void cancel(UUID userId, Instant now) {
        if (status == BookingStatus.CANCELLED) {
            throw new BookingAlreadyCancelledException();
        }
        if (!now.isBefore(getCancellationDeadline())) {
            throw new CancellationTooLateException(CANCELLATION_NOTICE);
        }
        this.status = BookingStatus.CANCELLED;
        this.cancelledAt = now;
        this.cancelledBy = userId;
    }
}
