package com.fitcoach.booking.repository;

import com.fitcoach.booking.domain.Booking;
import com.fitcoach.booking.domain.BookingStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findBySlotIdInAndStatus(Collection<UUID> slotIds, BookingStatus status);

    boolean existsBySlotIdAndStatus(UUID slotId, BookingStatus status);

    @Modifying
    @Query("DELETE FROM Booking b WHERE b.slotId = :slotId AND b.status = :status")
    void deleteBySlotIdAndStatus(@Param("slotId") UUID slotId, @Param("status") BookingStatus status);

    /** Reservations ou l'utilisateur est l'athlete ou le coach, debut dans {@code [from, to)}. */
    @Query("""
            SELECT b FROM Booking b
            WHERE (b.athleteId = :userId OR b.coachId = :userId)
              AND b.startsAt >= :from AND b.startsAt < :to
            ORDER BY b.startsAt
            """)
    List<Booking> findForParticipant(
            @Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to);
}
