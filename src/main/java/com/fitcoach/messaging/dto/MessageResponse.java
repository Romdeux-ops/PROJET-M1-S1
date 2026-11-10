package com.fitcoach.messaging.dto;

import com.fitcoach.messaging.domain.Message;
import java.time.Instant;
import java.util.UUID;

public record MessageResponse(UUID id, UUID conversationId, UUID senderId, String body, Instant sentAt, Instant readAt) {

    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getBody(),
                message.getSentAt(),
                message.getReadAt());
    }
}
