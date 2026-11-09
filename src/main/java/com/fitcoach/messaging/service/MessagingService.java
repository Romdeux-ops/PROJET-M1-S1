package com.fitcoach.messaging.service;

import com.fitcoach.coaching.api.CoachRelations;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.messaging.domain.Conversation;
import com.fitcoach.messaging.domain.Message;
import com.fitcoach.messaging.dto.ConversationResponse;
import com.fitcoach.messaging.dto.MessagePageResponse;
import com.fitcoach.messaging.dto.MessageResponse;
import com.fitcoach.messaging.dto.SendMessageRequest;
import com.fitcoach.messaging.exception.ConversationNotFoundException;
import com.fitcoach.messaging.exception.InvalidPageRequestException;
import com.fitcoach.messaging.exception.NotActiveRelationException;
import com.fitcoach.messaging.repository.ConversationRepository;
import com.fitcoach.messaging.repository.MessageRepository;
import com.fitcoach.messaging.repository.MessageRepository.UnreadCount;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Conversations coach / athlete et leurs messages.
 *
 * <p>Seuls les participants voient une conversation (un tiers recoit 404).
 * Ouvrir une conversation ou y ecrire exige une relation coach / athlete
 * active ; une fois la relation terminee, l'historique reste lisible.
 */
@Service
@Transactional(readOnly = true)
public class MessagingService {

    public static final int DEFAULT_PAGE_SIZE = 30;
    public static final int MAX_PAGE_SIZE = 100;

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final CoachRelations coachRelations;
    private final UserDirectory userDirectory;
    private final Clock clock;

    public MessagingService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            CoachRelations coachRelations,
            UserDirectory userDirectory,
            Clock clock) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.coachRelations = coachRelations;
        this.userDirectory = userDirectory;
        this.clock = clock;
    }

    /** Conversation renvoyee par {@link #startConversation}, et si elle vient d'etre creee. */
    public record StartedConversation(ConversationResponse conversation, boolean created) {}

    /** Ouvre la conversation avec {@code counterpartId}, ou renvoie celle qui existe deja. */
    @Transactional
    public StartedConversation startConversation(UUID userId, UUID counterpartId) {
        UUID coachId;
        UUID athleteId;
        if (coachRelations.isActiveClient(userId, counterpartId)) {
            coachId = userId;
            athleteId = counterpartId;
        } else if (coachRelations.isActiveClient(counterpartId, userId)) {
            coachId = counterpartId;
            athleteId = userId;
        } else {
            throw new NotActiveRelationException();
        }

        boolean created = conversationRepository.insertIfAbsent(coachId, athleteId) == 1;
        Conversation conversation = conversationRepository
                .findByCoachIdAndAthleteId(coachId, athleteId)
                .orElseThrow(IllegalStateException::new);
        return new StartedConversation(toResponses(userId, List.of(conversation)).getFirst(), created);
    }

    public List<ConversationResponse> listConversations(UUID userId) {
        return toResponses(userId, conversationRepository.findForParticipant(userId));
    }

    /**
     * Historique plus recent d'abord, {@code size} messages au plus, strictement
     * anterieurs au message {@code before} s'il est fourni.
     */
    public MessagePageResponse listMessages(UUID conversationId, UUID userId, UUID before, Integer size) {
        Conversation conversation = participantConversation(conversationId, userId);
        int pageSize = size == null ? DEFAULT_PAGE_SIZE : size;
        if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
            throw new InvalidPageRequestException(
                    "La taille de page doit etre comprise entre 1 et " + MAX_PAGE_SIZE + ".");
        }

        // Une ligne de plus que demande indique s'il reste des messages plus anciens.
        Limit limit = Limit.of(pageSize + 1);
        List<Message> messages = before == null
                ? messageRepository.findByConversationIdOrderBySentAtDescIdDesc(conversation.getId(), limit)
                : olderThan(conversation.getId(), before, limit);

        boolean hasMore = messages.size() > pageSize;
        List<Message> page = hasMore ? messages.subList(0, pageSize) : messages;
        UUID nextCursor = hasMore ? page.getLast().getId() : null;
        return new MessagePageResponse(page.stream().map(MessageResponse::from).toList(), nextCursor);
    }

    @Transactional
    public MessageResponse send(UUID conversationId, UUID userId, SendMessageRequest request) {
        Conversation conversation = participantConversation(conversationId, userId);
        if (!coachRelations.isActiveClient(conversation.getCoachId(), conversation.getAthleteId())) {
            throw new NotActiveRelationException();
        }

        Message message = new Message(conversation.getId(), userId, request.body().strip(), now());
        messageRepository.saveAndFlush(message);
        conversationRepository.recordMessage(conversation.getId(), message.getSentAt());
        return MessageResponse.from(message);
    }

    /** Marque comme lus les messages recus ; reste permis apres la fin de la relation. */
    @Transactional
    public void markRead(UUID conversationId, UUID userId) {
        Conversation conversation = participantConversation(conversationId, userId);
        messageRepository.markRead(conversation.getId(), userId, now());
    }

    private List<Message> olderThan(UUID conversationId, UUID before, Limit limit) {
        Message cursor = messageRepository
                .findByIdAndConversationId(before, conversationId)
                .orElseThrow(() -> new InvalidPageRequestException("Curseur de pagination invalide."));
        return messageRepository.findBefore(conversationId, cursor.getSentAt(), cursor.getId(), limit);
    }

    private Conversation participantConversation(UUID conversationId, UUID userId) {
        return conversationRepository
                .findById(conversationId)
                .filter(c -> c.involves(userId))
                .orElseThrow(ConversationNotFoundException::new);
    }

    /** Apercus, non-lus et noms charges en une requete chacun, quel que soit le nombre de conversations. */
    private List<ConversationResponse> toResponses(UUID viewerId, List<Conversation> conversations) {
        if (conversations.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = conversations.stream().map(Conversation::getId).toList();
        Map<UUID, Message> lastMessages = messageRepository.findLatestByConversation(ids).stream()
                .collect(Collectors.toMap(Message::getConversationId, Function.identity()));
        Map<UUID, Long> unread = messageRepository.countUnread(ids, viewerId).stream()
                .collect(Collectors.toMap(UnreadCount::getConversationId, UnreadCount::getCount));
        Map<UUID, UserSummary> users = userDirectory.findAllById(
                conversations.stream().map(c -> c.counterpartOf(viewerId)).distinct().toList());

        return conversations.stream()
                .map(c -> ConversationResponse.from(
                        c,
                        viewerId,
                        displayName(users.get(c.counterpartOf(viewerId))),
                        lastMessages.get(c.getId()),
                        unread.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    /** Tronque a la microseconde, la precision de {@code timestamptz} : l'instant renvoye est celui stocke. */
    private Instant now() {
        return clock.instant().truncatedTo(ChronoUnit.MICROS);
    }

    private static String displayName(UserSummary user) {
        return user == null ? "" : user.displayName();
    }
}
