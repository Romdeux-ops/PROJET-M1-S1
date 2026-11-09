package com.fitcoach.messaging.repository;

import com.fitcoach.messaging.domain.Message;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Optional<Message> findByIdAndConversationId(UUID id, UUID conversationId);

    /** Premiere page de l'historique, plus recent d'abord. */
    List<Message> findByConversationIdOrderBySentAtDescIdDesc(UUID conversationId, Limit limit);

    /** Page suivante : messages strictement anterieurs au curseur {@code (sentAt, id)}. */
    @Query("""
            SELECT m FROM Message m
            WHERE m.conversationId = :conversationId
              AND (m.sentAt < :sentAt OR (m.sentAt = :sentAt AND m.id < :id))
            ORDER BY m.sentAt DESC, m.id DESC
            """)
    List<Message> findBefore(
            @Param("conversationId") UUID conversationId,
            @Param("sentAt") Instant sentAt,
            @Param("id") UUID id,
            Limit limit);

    /** Dernier message de chaque conversation (celles sans message sont absentes). */
    @Query(value = """
            SELECT DISTINCT ON (conversation_id) *
            FROM messages
            WHERE conversation_id IN (:conversationIds)
            ORDER BY conversation_id, created_at DESC, id DESC
            """, nativeQuery = true)
    List<Message> findLatestByConversation(@Param("conversationIds") Collection<UUID> conversationIds);

    /** Non-lus de {@code readerId} par conversation (celles a zero sont absentes). */
    @Query("""
            SELECT m.conversationId AS conversationId, COUNT(m) AS count
            FROM Message m
            WHERE m.conversationId IN :conversationIds AND m.senderId <> :readerId AND m.readAt IS NULL
            GROUP BY m.conversationId
            """)
    List<UnreadCount> countUnread(
            @Param("conversationIds") Collection<UUID> conversationIds, @Param("readerId") UUID readerId);

    /** Marque comme lus tous les messages recus par {@code readerId} dans la conversation. */
    @Modifying
    @Query("""
            UPDATE Message m SET m.readAt = :now
            WHERE m.conversationId = :conversationId AND m.senderId <> :readerId AND m.readAt IS NULL
            """)
    int markRead(
            @Param("conversationId") UUID conversationId,
            @Param("readerId") UUID readerId,
            @Param("now") Instant now);

    interface UnreadCount {
        UUID getConversationId();

        long getCount();
    }
}
