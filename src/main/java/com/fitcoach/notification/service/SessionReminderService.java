package com.fitcoach.notification.service;

import com.fitcoach.notification.api.NotificationType;
import com.fitcoach.notification.api.Notifier;
import com.fitcoach.planning.api.UpcomingSessions;
import com.fitcoach.planning.api.UpcomingSessions.PlannedSession;
import java.time.Clock;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * Rappelle aux athletes leurs seances encore planifiees aujourd'hui ou demain
 * (dates au fuseau metier de l'horloge). Chaque rappel porte une cle de
 * deduplication {@code reminder:<seance>:<date>} : relancer le job ne cree rien
 * de plus, et une seance reprogrammee a une autre date est rappelee a nouveau.
 */
@Service
public class SessionReminderService {

    private static final String PLANNING_LINK = "/planning";

    private final UpcomingSessions upcomingSessions;
    private final Notifier notifier;
    private final Clock clock;

    public SessionReminderService(UpcomingSessions upcomingSessions, Notifier notifier, Clock clock) {
        this.upcomingSessions = upcomingSessions;
        this.notifier = notifier;
        this.clock = clock;
    }

    /** @return le nombre de rappels nouvellement crees */
    public int sendReminders() {
        LocalDate today = LocalDate.now(clock);
        LocalDate tomorrow = today.plusDays(1);
        int created = 0;
        for (PlannedSession session : upcomingSessions.plannedBetween(today, tomorrow)) {
            boolean isToday = session.scheduledDate().equals(today);
            String title = isToday ? "Séance prévue aujourd'hui" : "Séance prévue demain";
            String body = "« " + session.title() + " » est au programme " + (isToday ? "aujourd'hui." : "demain.");
            String dedupeKey = "reminder:" + session.id() + ":" + session.scheduledDate();
            if (notifier.notify(
                    session.athleteId(), NotificationType.SESSION_REMINDER, title, body, PLANNING_LINK, dedupeKey)) {
                created++;
            }
        }
        return created;
    }
}
