package com.fitcoach.identity.api;

import com.fitcoach.common.security.RoleCode;
import java.util.List;
import java.util.UUID;

/**
 * Vue publique d'un compte, seule representation d'un utilisateur exposee aux
 * autres modules. Meme forme JSON que {@code SessionUser} cote frontend.
 */
public record UserSummary(
        UUID id, String email, String firstName, String lastName, List<RoleCode> roles, String avatarUrl) {

    public String displayName() {
        return firstName + " " + lastName;
    }

    public boolean hasRole(RoleCode role) {
        return roles.contains(role);
    }
}
