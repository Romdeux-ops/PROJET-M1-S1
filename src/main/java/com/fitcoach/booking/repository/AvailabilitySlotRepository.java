package com.fitcoach.booking.repository;

import com.fitcoach.booking.domain.AvailabilitySlot;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

    List<AvailabilitySlot> findByCoachIdAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAt(
            UUID coachId, Instant from, Instant to);

    /** Creneaux sans reservation confirmee, debut dans {@code [from, to)}. */
    @Query("""
            SELECT s FROM AvailabilitySlot s
            WHERE s.coachId IN :coachIds
              AND s.startsAt >= :from AND s.startsAt < :to
              AND NOT EXISTS (
                  SELECT 1 FROM Booking b
                  WHERE b.slotId = s.id AND b.status = com.fitcoach.booking.domain.BookingStatus.CONFIRMED)
            ORDER BY s.startsAt
            """)
    List<AvailabilitySlot> findFree(
            @Param("coachIds") Collection<UUID> coachIds, @Param("from") Instant from, @Param("to") Instant to);
}
