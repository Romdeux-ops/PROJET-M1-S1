package com.fitcoach.booking.service;

import com.fitcoach.booking.domain.AvailabilitySlot;
import com.fitcoach.booking.domain.Booking;
import com.fitcoach.booking.domain.BookingStatus;
import com.fitcoach.booking.dto.BookingRequest;
import com.fitcoach.booking.dto.BookingResponse;
import com.fitcoach.booking.dto.SlotRequest;
import com.fitcoach.booking.dto.SlotResponse;
import com.fitcoach.booking.exception.AthleteBookingOverlapException;
import com.fitcoach.booking.exception.BookingNotFoundException;
import com.fitcoach.booking.exception.InvalidDateRangeException;
import com.fitcoach.booking.exception.InvalidSlotException;
import com.fitcoach.booking.exception.NotActiveClientException;
import com.fitcoach.booking.exception.SlotAlreadyBookedException;
import com.fitcoach.booking.exception.SlotHasBookingException;
import com.fitcoach.booking.exception.SlotNotFoundException;
import com.fitcoach.booking.exception.SlotOverlapException;
import com.fitcoach.booking.repository.AvailabilitySlotRepository;
import com.fitcoach.booking.repository.BookingRepository;
import com.fitcoach.coaching.api.CoachRelations;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.notification.api.NotificationType;
import com.fitcoach.notification.api.Notifier;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Publication de creneaux et reservations.
 *
 * <p>L'absence de double reservation est garantie par les contraintes de V9 ;
 * ce service se contente de traduire leurs violations en erreurs metier
 * lisibles, y compris quand deux requetes concurrentes se croisent.
 */
@Service
@Transactional(readOnly = true)
public class BookingService {

    private static final int MAX_RANGE_DAYS = 366;
    private static final Duration MIN_SLOT_DURATION = Duration.ofMinutes(15);
    private static final Duration MAX_SLOT_DURATION = Duration.ofHours(4);

    /** Route frontend de la page de reservation, ouverte au clic sur la notification. */
    private static final String BOOKING_LINK = "/booking";

    private static final DateTimeFormatter START_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'à' HH:mm", Locale.FRENCH);

    private static final String UNIQUE_VIOLATION = "23505";
    private static final String FOREIGN_KEY_VIOLATION = "23503";
    private static final String EXCLUSION_VIOLATION = "23P01";

    private final AvailabilitySlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final CoachRelations coachRelations;
    private final UserDirectory userDirectory;
    private final Notifier notifier;
    private final Clock clock;

    public BookingService(
            AvailabilitySlotRepository slotRepository,
            BookingRepository bookingRepository,
            CoachRelations coachRelations,
            UserDirectory userDirectory,
            Notifier notifier,
            Clock clock) {
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
        this.coachRelations = coachRelations;
        this.userDirectory = userDirectory;
        this.notifier = notifier;
        this.clock = clock;
    }

    @Transactional
    public SlotResponse createSlot(UUID coachId, SlotRequest request) {
        Duration duration = Duration.between(request.startsAt(), request.endsAt());
        if (duration.compareTo(MIN_SLOT_DURATION) < 0 || duration.compareTo(MAX_SLOT_DURATION) > 0) {
            throw new InvalidSlotException("Un creneau dure entre 15 minutes et 4 heures.");
        }
        if (!request.startsAt().isAfter(clock.instant())) {
            throw new InvalidSlotException("Un creneau doit commencer dans le futur.");
        }

        AvailabilitySlot slot = new AvailabilitySlot(coachId, request.startsAt(), request.endsAt());
        try {
            slotRepository.saveAndFlush(slot);
        } catch (DataIntegrityViolationException e) {
            if (hasSqlState(e, EXCLUSION_VIOLATION)) {
                throw new SlotOverlapException();
            }
            throw e;
        }
        return SlotResponse.free(slot, displayName(coachId));
    }

    public List<SlotResponse> listCoachSlots(UUID coachId, LocalDate from, LocalDate to) {
        Range range = range(from, to);
        List<AvailabilitySlot> slots = slotRepository
                .findByCoachIdAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAt(coachId, range.from(), range.to());
        if (slots.isEmpty()) {
            return List.of();
        }

        Map<UUID, Booking> bookingBySlot = bookingRepository
                .findBySlotIdInAndStatus(slots.stream().map(AvailabilitySlot::getId).toList(), BookingStatus.CONFIRMED)
                .stream()
                .collect(Collectors.toMap(Booking::getSlotId, Function.identity()));
        Map<UUID, UserSummary> users = userDirectory.findAllById(Stream.concat(
                        Stream.of(coachId), bookingBySlot.values().stream().map(Booking::getAthleteId))
                .toList());
        String coachName = displayName(users.get(coachId));

        return slots.stream()
                .map(slot -> {
                    Booking booking = bookingBySlot.get(slot.getId());
                    return booking == null
                            ? SlotResponse.free(slot, coachName)
                            : SlotResponse.booked(slot, coachName, booking, displayName(users.get(booking.getAthleteId())));
                })
                .toList();
    }

    /** Creneaux libres et a venir des coachs actifs de l'athlete. */
    public List<SlotResponse> listAvailableSlots(UUID athleteId, LocalDate from, LocalDate to) {
        Range range = range(from, to);
        List<UUID> coachIds = coachRelations.activeCoachIds(athleteId);
        Instant now = clock.instant();
        if (coachIds.isEmpty() || !range.to().isAfter(now)) {
            return List.of();
        }

        Instant start = range.from().isAfter(now) ? range.from() : now;
        Map<UUID, UserSummary> coaches = userDirectory.findAllById(coachIds);
        return slotRepository.findFree(coachIds, start, range.to()).stream()
                .map(slot -> SlotResponse.free(slot, displayName(coaches.get(slot.getCoachId()))))
                .toList();
    }

    @Transactional
    public void deleteSlot(UUID slotId, UUID coachId) {
        AvailabilitySlot slot = slotRepository
                .findById(slotId)
                .filter(s -> s.isOwnedBy(coachId))
                .orElseThrow(SlotNotFoundException::new);
        if (bookingRepository.existsBySlotIdAndStatus(slotId, BookingStatus.CONFIRMED)) {
            throw new SlotHasBookingException();
        }

        bookingRepository.deleteBySlotIdAndStatus(slotId, BookingStatus.CANCELLED);
        try {
            slotRepository.delete(slot);
            slotRepository.flush();
        } catch (DataIntegrityViolationException e) {
            if (hasSqlState(e, FOREIGN_KEY_VIOLATION)) {
                throw new SlotHasBookingException();
            }
            throw e;
        }
    }

    @Transactional
    public BookingResponse book(UUID athleteId, BookingRequest request) {
        AvailabilitySlot slot = slotRepository.findById(request.slotId()).orElseThrow(SlotNotFoundException::new);
        if (!coachRelations.isActiveClient(slot.getCoachId(), athleteId)) {
            throw new NotActiveClientException();
        }
        if (slot.hasStartedAt(clock.instant())) {
            throw new InvalidSlotException("Ce creneau est deja passe.");
        }

        Booking booking = new Booking(slot, athleteId, request.note());
        try {
            bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException e) {
            if (hasSqlState(e, UNIQUE_VIOLATION)) {
                throw new SlotAlreadyBookedException();
            }
            if (hasSqlState(e, EXCLUSION_VIOLATION)) {
                throw new AthleteBookingOverlapException();
            }
            throw e;
        }
        notifier.notify(
                booking.getCoachId(),
                NotificationType.BOOKING_CREATED,
                "Nouvelle réservation",
                displayName(athleteId) + " a réservé le créneau du " + formatStart(booking) + ".",
                BOOKING_LINK,
                "booking-created:" + booking.getId());
        return toResponse(booking);
    }

    /** Reservations ou l'utilisateur est athlete ou coach, annulees comprises. */
    public List<BookingResponse> listBookings(UUID userId, LocalDate from, LocalDate to) {
        Range range = range(from, to);
        List<Booking> bookings = bookingRepository.findForParticipant(userId, range.from(), range.to());
        Map<UUID, UserSummary> users = userDirectory.findAllById(bookings.stream()
                .flatMap(b -> Stream.of(b.getCoachId(), b.getAthleteId()))
                .distinct()
                .toList());
        return bookings.stream()
                .map(b -> BookingResponse.from(
                        b, displayName(users.get(b.getCoachId())), displayName(users.get(b.getAthleteId()))))
                .toList();
    }

    @Transactional
    public BookingResponse cancel(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository
                .findById(bookingId)
                .filter(b -> b.involves(userId))
                .orElseThrow(BookingNotFoundException::new);
        booking.cancel(userId, clock.instant());
        // L'autre partie est prevenue : le coach quand l'athlete annule, l'athlete quand c'est le coach.
        UUID recipientId = booking.getCoachId().equals(userId) ? booking.getAthleteId() : booking.getCoachId();
        notifier.notify(
                recipientId,
                NotificationType.BOOKING_CANCELLED,
                "Réservation annulée",
                displayName(userId) + " a annulé la réservation du " + formatStart(booking) + ".",
                BOOKING_LINK,
                "booking-cancelled:" + booking.getId() + ":" + recipientId);
        return toResponse(booking);
    }

    /** Debut du creneau au fuseau metier, ex. {@code 12/01/2026 à 18:30}. */
    private String formatStart(Booking booking) {
        return START_FORMAT.format(booking.getStartsAt().atZone(clock.getZone()));
    }

    private BookingResponse toResponse(Booking booking) {
        Map<UUID, UserSummary> users =
                userDirectory.findAllById(List.of(booking.getCoachId(), booking.getAthleteId()));
        return BookingResponse.from(
                booking, displayName(users.get(booking.getCoachId())), displayName(users.get(booking.getAthleteId())));
    }

    private String displayName(UUID userId) {
        return displayName(userDirectory.findById(userId).orElse(null));
    }

    private static String displayName(UserSummary user) {
        return user == null ? "" : user.displayName();
    }

    /** Jours {@code from} a {@code to} inclus, bornes prises a minuit dans le fuseau metier. */
    private Range range(LocalDate from, LocalDate to) {
        if (to.isBefore(from) || ChronoUnit.DAYS.between(from, to) >= MAX_RANGE_DAYS) {
            throw new InvalidDateRangeException(MAX_RANGE_DAYS);
        }
        ZoneId zone = clock.getZone();
        return new Range(
                from.atStartOfDay(zone).toInstant(), to.plusDays(1).atStartOfDay(zone).toInstant());
    }

    private static boolean hasSqlState(Throwable error, String sqlState) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof SQLException sql && sqlState.equals(sql.getSQLState())) {
                return true;
            }
        }
        return false;
    }

    private record Range(Instant from, Instant to) {}
}
