package com.fitcoach.common.security;

import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/**
 * Empeche le demarrage hors profils dev et test avec un secret JWT connu : les
 * valeurs de repli sont versionnees, et quiconque les connait peut signer un
 * jeton ADMIN, puisque les roles sont lus dans le jeton.
 */
@Component
public class JwtSecretGuard {

    private static final Set<String> PUBLIC_SECRETS = Set.of(
            "dev-only-secret-key-please-rotate-32bytes-min", "test-only-secret-key-please-rotate-32bytes-min");

    public JwtSecretGuard(Environment environment, @Value("${app.jwt.secret}") String secret) {
        if (environment.acceptsProfiles(Profiles.of("dev", "test"))) {
            return;
        }
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET doit etre defini hors des profils dev et test.");
        }
        if (PUBLIC_SECRETS.contains(secret)) {
            throw new IllegalStateException(
                    "JWT_SECRET vaut une valeur de developpement versionnee : definissez un secret propre a cet environnement.");
        }
    }
}
