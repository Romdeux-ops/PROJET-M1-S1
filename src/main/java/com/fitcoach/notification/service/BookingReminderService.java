package com.fitcoach.notification.service;

import com.fitcoach.booking.api.UpcomingBookings;
import com.fitcoach.booking.api.UpcomingBookings.UpcomingBooking;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.notification.api.NotificationType;
import com.fitcoach.notification.api.Notifier;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;

/**
 * Rappelle a l'athlete ET au coach leurs rendez-vous confirmes qui commencent
 * aujourd'hui (pas encore commences) ou demain, au fuseau metier de l'horloge.
 * La cle de deduplication porte la reservation, le destinataire et la date :
 * relancer le job ne cree rien de plus.
 */
@Service
public class BookingReminderService {

    private static final String BOOKING_LINK = "/booking";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm", Locale.FRENCH);

    private final UpcomingBookings upcomingBookings;
    private final UserDirectory userDirectory;
    private final Notifier notifier;
    private final Clock clock;

    public BookingReminderService(
            UpcomingBookings upcomingBookings, UserDirectory userDirectory, Notifier notifier, Clock clock) {
        this.upcomingBookings = upcomingBookings;
        this.userDirectory = userDirectory;
        this.notifier = notifier;
        this.clock = clock;
    }

    /** @return le nombre de rappels nouvellement crees */
    public int sendReminders() {
        ZoneId zone = clock.getZone();
        LocalDate today = LocalDate.now(clock);
        List<UpcomingBooking> bookings = upcomingBookings.confirmedStartingBetween(
                clock.instant(), today.plusDays(2).atStartOfDay(zone).toInstant());
        if (bookings.isEmpty()) {
            return 0;
        }

        Set<UUID> userIds = bookings.stream()
                .flatMap(b -> Stream.of(b.coachId(), b.athleteId()))
                .collect(Collectors.toSet());
        Map<UUID, UserSummary> users = userDirectory.findAllById(userIds);

        int created = 0;
        for (UpcomingBooking booking : bookings) {
            var start = booking.startsAt().atZone(zone);
            LocalDate date = start.toLocalDate();
            String when = (date.equals(today) ? "aujourd'hui" : "demain") + " à " + TIME_FORMAT.format(start);
            String title = date.equals(today) ? "Rendez-vous aujourd'hui" : "Rendez-vous demain";

            String withCoach = "Rendez-vous avec " + name(users, booking.coachId()) + " " + when + ".";
            String withAthlete = "Rendez-vous avec " + name(users, booking.athleteId()) + " " + when + ".";
            created += remind(booking, booking.athleteId(), title, withCoach, date);
            created += remind(booking, booking.coachId(), title, withAthlete, date);
        }
        return created;
    }

    private int remind(UpcomingBooking booking, UUID recipientId, String title, String body, LocalDate date) {
        String dedupeKey = "booking-reminder:" + booking.id() + ":" + recipientId + ":" + date;
        return notifier.notify(recipientId, NotificationType.BOOKING_REMINDER, title, body, BOOKING_LINK, dedupeKey)
                ? 1
                : 0;
    }

    private static String name(Map<UUID, UserSummary> users, UUID userId) {
        UserSummary user = users.get(userId);
        return user == null ? "votre interlocuteur" : user.displayName();
    }
}
