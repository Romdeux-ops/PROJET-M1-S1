package com.fitcoach.messaging.repository;

import com.fitcoach.messaging.domain.Conversation;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByCoachIdAndAthleteId(UUID coachId, UUID athleteId);

    /**
     * Cree la conversation de la paire si elle n'existe pas encore. Sous acces
     * concurrent, la seconde insertion attend la premiere puis ne fait rien.
     *
     * @return 1 si la conversation vient d'etre creee, 0 si elle existait deja
     */
    @Modifying
    @Query(value = """
            INSERT INTO conversations (coach_id, athlete_id) VALUES (:coachId, :athleteId)
            ON CONFLICT (coach_id, athlete_id) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(@Param("coachId") UUID coachId, @Param("athleteId") UUID athleteId);

    /** Conversations de l'utilisateur, les plus recemment actives d'abord. */
    @Query("""
            SELECT c FROM Conversation c
            WHERE c.coachId = :userId OR c.athleteId = :userId
            ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC
            """)
    List<Conversation> findForParticipant(@Param("userId") UUID userId);

    /** N'avance jamais la date : un envoi plus ancien qui se termine en dernier ne la fait pas reculer. */
    @Modifying
    @Query("""
            UPDATE Conversation c SET c.lastMessageAt = :sentAt
            WHERE c.id = :id AND (c.lastMessageAt IS NULL OR c.lastMessageAt < :sentAt)
            """)
    void recordMessage(@Param("id") UUID conversationId, @Param("sentAt") Instant sentAt);
}
