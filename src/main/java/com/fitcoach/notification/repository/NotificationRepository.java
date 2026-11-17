package com.fitcoach.notification.repository;

import com.fitcoach.notification.domain.Notification;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /** Plus recentes d'abord ; {@code id} departage deux notifications de meme instant. */
    Page<Notification> findByUserIdOrderByCreatedAtDescIdDesc(UUID userId, Pageable pageable);

    long countByUserIdAndReadAtIsNull(UUID userId);

    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Cree la notification si la cle de deduplication n'existe pas deja pour ce
     * destinataire. Sous acces concurrent, la seconde insertion attend la
     * premiere puis ne fait rien.
     *
     * @return 1 si la notification vient d'etre creee, 0 si elle existait deja
     */
    @Modifying
    @Query(value = """
            INSERT INTO notifications (user_id, type, title, body, link, dedupe_key, created_at)
            VALUES (:userId, :type, :title, :body, :link, :dedupeKey, :now)
            ON CONFLICT (user_id, dedupe_key) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("title") String title,
            @Param("body") String body,
            @Param("link") String link,
            @Param("dedupeKey") String dedupeKey,
            @Param("now") Instant now);

    @Modifying
    @Query("""
            UPDATE Notification n SET n.readAt = :now
            WHERE n.id = :id AND n.userId = :userId AND n.readAt IS NULL
            """)
    int markRead(@Param("id") UUID id, @Param("userId") UUID userId, @Param("now") Instant now);

    @Modifying
    @Query("""
            UPDATE Notification n SET n.readAt = :now
            WHERE n.userId = :userId AND n.readAt IS NULL
            """)
    int markAllRead(@Param("userId") UUID userId, @Param("now") Instant now);
}
