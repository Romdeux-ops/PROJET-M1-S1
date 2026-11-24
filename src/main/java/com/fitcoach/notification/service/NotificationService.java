package com.fitcoach.notification.service;

import com.fitcoach.common.web.PageResponse;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.notification.api.NotificationType;
import com.fitcoach.notification.api.Notifier;
import com.fitcoach.notification.dto.NotificationResponse;
import com.fitcoach.notification.exception.NotificationNotFoundException;
import com.fitcoach.notification.repository.NotificationRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Notifications d'un utilisateur. Une notification d'autrui est traitee comme
 * inexistante (404), jamais comme interdite.
 */
@Service
@Transactional(readOnly = true)
public class NotificationService implements Notifier {

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    /**
     * Types coupes quand l'utilisateur desactive ses notifications : les rappels. Les evenements
     * (reservation creee ou annulee, seance a valider ou validee) restent toujours envoyes.
     */
    public static final Set<NotificationType> MUTABLE_TYPES =
            EnumSet.of(NotificationType.SESSION_REMINDER, NotificationType.BOOKING_REMINDER);

    private final NotificationRepository notificationRepository;
    private final UserDirectory userDirectory;
    private final Clock clock;

    public NotificationService(NotificationRepository notificationRepository, UserDirectory userDirectory, Clock clock) {
        this.notificationRepository = notificationRepository;
        this.userDirectory = userDirectory;
        this.clock = clock;
    }

    @Override
    @Transactional
    public boolean notify(
            UUID userId, NotificationType type, String title, String body, String link, String dedupeKey) {
        if (MUTABLE_TYPES.contains(type) && !userDirectory.notificationsEnabled(userId)) {
            return false;
        }
        return notificationRepository.insertIfAbsent(userId, type.name(), title, body, link, dedupeKey, now()) == 1;
    }

    public PageResponse<NotificationResponse> list(UUID userId, int page, int size) {
        int boundedSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageResponse.of(notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(userId, PageRequest.of(Math.max(page, 0), boundedSize))
                .map(NotificationResponse::from));
    }

    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markRead(UUID notificationId, UUID userId) {
        notificationRepository
                .findByIdAndUserId(notificationId, userId)
                .orElseThrow(NotificationNotFoundException::new);
        notificationRepository.markRead(notificationId, userId, now());
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId, now());
    }

    /** Tronque a la microseconde, la precision de {@code timestamptz}. */
    private Instant now() {
        return clock.instant().truncatedTo(ChronoUnit.MICROS);
    }
}
