package com.fitcoach.messaging.dto;

import com.fitcoach.messaging.domain.Conversation;
import com.fitcoach.messaging.domain.Message;
import java.time.Instant;
import java.util.UUID;

/** Conversation vue par l'un de ses participants. */
public record ConversationResponse(
        UUID id,
        UUID counterpartId,
        String counterpartName,
        String lastMessagePreview,
        UUID lastMessageSenderId,
        Instant lastMessageAt,
        long unreadCount) {

    static final int PREVIEW_LENGTH = 120;

    public static ConversationResponse from(
            Conversation conversation, UUID viewerId, String counterpartName, Message lastMessage, long unreadCount) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.counterpartOf(viewerId),
                counterpartName,
                lastMessage == null ? null : preview(lastMessage.getBody()),
                lastMessage == null ? null : lastMessage.getSenderId(),
                lastMessage == null ? null : lastMessage.getSentAt(),
                unreadCount);
    }

    private static String preview(String body) {
        return body.length() <= PREVIEW_LENGTH ? body : body.substring(0, PREVIEW_LENGTH - 1) + "…";
    }
}
