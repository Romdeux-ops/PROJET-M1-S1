package com.fitcoach.booking.service;

import com.fitcoach.booking.api.UpcomingBookings;
import com.fitcoach.booking.domain.BookingStatus;
import com.fitcoach.booking.repository.BookingRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaUpcomingBookings implements UpcomingBookings {

    private final BookingRepository bookingRepository;

    JpaUpcomingBookings(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public List<UpcomingBooking> confirmedStartingBetween(Instant from, Instant to) {
        return bookingRepository
                .findByStatusAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAt(
                        BookingStatus.CONFIRMED, from, to)
                .stream()
                .map(b -> new UpcomingBooking(b.getId(), b.getCoachId(), b.getAthleteId(), b.getStartsAt()))
                .toList();
    }
}
