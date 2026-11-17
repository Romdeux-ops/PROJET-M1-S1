package com.fitcoach.notification.config;

import com.fitcoach.notification.service.BookingReminderService;
import com.fitcoach.notification.service.SessionReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Declenche les rappels au demarrage puis a intervalle regulier. Desactivable
 * ({@code app.notifications.scheduling-enabled=false}) : les tests appellent
 * directement {@link SessionReminderService}.
 */
@Configuration(proxyBeanMethods = false)
@EnableScheduling
@ConditionalOnProperty(name = "app.notifications.scheduling-enabled", havingValue = "true", matchIfMissing = true)
public class ReminderScheduling {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduling.class);

    private final SessionReminderService sessionReminders;
    private final BookingReminderService bookingReminders;

    ReminderScheduling(SessionReminderService sessionReminders, BookingReminderService bookingReminders) {
        this.sessionReminders = sessionReminders;
        this.bookingReminders = bookingReminders;
    }

    @Scheduled(
            initialDelayString = "${app.notifications.reminder-initial-delay:PT10S}",
            fixedDelayString = "${app.notifications.reminder-interval:PT15M}")
    void sendReminders() {
        try {
            int created = sessionReminders.sendReminders();
            if (created > 0) {
                log.info("{} rappel(s) de seance cree(s)", created);
            }
        } catch (RuntimeException e) {
            log.warn("Echec du job de rappels de seance", e);
        }
        // Isoles : un echec cote seances ne doit pas priver les reservations de leurs rappels.
        try {
            int created = bookingReminders.sendReminders();
            if (created > 0) {
                log.info("{} rappel(s) de reservation cree(s)", created);
            }
        } catch (RuntimeException e) {
            log.warn("Echec du job de rappels de reservation", e);
        }
    }
}
