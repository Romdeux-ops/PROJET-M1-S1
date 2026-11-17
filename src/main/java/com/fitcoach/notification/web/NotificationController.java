package com.fitcoach.notification.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.common.web.PageResponse;
import com.fitcoach.notification.dto.NotificationResponse;
import com.fitcoach.notification.dto.UnreadCountResponse;
import com.fitcoach.notification.service.NotificationService;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** Notifications de l'utilisateur connecte, les plus recentes d'abord. */
    @GetMapping
    public PageResponse<NotificationResponse> list(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.list(AuthenticatedUsers.id(authentication), page, size);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(Authentication authentication) {
        return new UnreadCountResponse(notificationService.unreadCount(AuthenticatedUsers.id(authentication)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        notificationService.markAllRead(AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markRead(Authentication authentication, @PathVariable UUID notificationId) {
        notificationService.markRead(notificationId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }
}
