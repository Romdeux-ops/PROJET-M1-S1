package com.fitcoach.common.security;

import java.util.UUID;
import org.springframework.security.core.Authentication;

/** Le principal pose par {@link JwtAuthenticationFilter} est l'UUID de l'utilisateur, en texte. */
public final class AuthenticatedUsers {

    private AuthenticatedUsers() {}

    public static UUID id(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    /** Comme {@link #id}, mais renvoie {@code null} pour un visiteur anonyme (routes publiques). */
    public static UUID idOrNull(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public static boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(authority));
    }
}
