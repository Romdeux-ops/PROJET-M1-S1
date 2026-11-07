package com.fitcoach.booking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Creneau publie par un coach (table {@code availability_slots}, V9).
 *
 * <p>Immuable une fois publie : les reservations en recopient les horaires.
 * Pour deplacer un creneau, le coach le supprime et en publie un autre.
 */
@Entity
@Table(name = "availability_slots")
public class AvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "coach_id", nullable = false)
    private UUID coachId;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected AvailabilitySlot() {
        // JPA
    }

    public AvailabilitySlot(UUID coachId, Instant startsAt, Instant endsAt) {
        this.coachId = coachId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCoachId() {
        return coachId;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public boolean isOwnedBy(UUID userId) {
        return coachId.equals(userId);
    }

    public boolean hasStartedAt(Instant now) {
        return !startsAt.isAfter(now);
    }
}
