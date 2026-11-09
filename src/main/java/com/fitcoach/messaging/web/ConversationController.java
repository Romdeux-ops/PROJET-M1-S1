package com.fitcoach.messaging.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.messaging.dto.ConversationResponse;
import com.fitcoach.messaging.dto.MessagePageResponse;
import com.fitcoach.messaging.dto.MessageResponse;
import com.fitcoach.messaging.dto.SendMessageRequest;
import com.fitcoach.messaging.dto.StartConversationRequest;
import com.fitcoach.messaging.service.MessagingService;
import com.fitcoach.messaging.service.MessagingService.StartedConversation;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messaging/conversations")
public class ConversationController {

    private final MessagingService messagingService;

    public ConversationController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    /** Conversations de l'utilisateur connecte, les plus recemment actives d'abord. */
    @GetMapping
    public List<ConversationResponse> list(Authentication authentication) {
        return messagingService.listConversations(AuthenticatedUsers.id(authentication));
    }

    /** 201 si la conversation vient d'etre creee, 200 si elle existait deja. */
    @PostMapping
    public ResponseEntity<ConversationResponse> start(
            Authentication authentication, @Valid @RequestBody StartConversationRequest request) {
        StartedConversation started =
                messagingService.startConversation(AuthenticatedUsers.id(authentication), request.counterpartId());
        return ResponseEntity.status(started.created() ? HttpStatus.CREATED : HttpStatus.OK)
                .body(started.conversation());
    }

    @GetMapping("/{conversationId}/messages")
    public MessagePageResponse messages(
            Authentication authentication,
            @PathVariable UUID conversationId,
            @RequestParam(required = false) UUID before,
            @RequestParam(required = false) Integer size) {
        return messagingService.listMessages(conversationId, AuthenticatedUsers.id(authentication), before, size);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageResponse> send(
            Authentication authentication,
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response =
                messagingService.send(conversationId, AuthenticatedUsers.id(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{conversationId}/read")
    public ResponseEntity<Void> markRead(Authentication authentication, @PathVariable UUID conversationId) {
        messagingService.markRead(conversationId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }
}
