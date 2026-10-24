package com.fitcoach.common.security;

import com.fitcoach.identity.domain.RoleCode;
import com.fitcoach.identity.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Emission et validation des JWT d'acces.
 *
 * <p>Jeton stateless porteur du role : pas de session serveur, le contenu du
 * jeton (id, email, roles) suffit a reconstruire l'authentification a chaque
 * requete dans {@link JwtAuthenticationFilter}.
 */
@Component
public class JwtService {

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLES = "roles";

    private final SecretKey signingKey;
    private final Duration expiration;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = Duration.ofMinutes(expirationMinutes);
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        List<String> roles = user.getRoles().stream().map(Enum::name).toList();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim(CLAIM_EMAIL, user.getEmail())
                .claim(CLAIM_ROLES, roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(signingKey)
                .compact();
    }

    /** @throws JwtException si le jeton est invalide, expire ou mal signe. */
    public ParsedToken parse(String token) {
        Claims claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
        UUID userId = UUID.fromString(claims.getSubject());
        List<?> rawRoles = claims.get(CLAIM_ROLES, List.class);
        List<RoleCode> roles =
                rawRoles == null ? List.of() : rawRoles.stream().map(Object::toString).map(RoleCode::valueOf).toList();
        return new ParsedToken(userId, roles);
    }

    public record ParsedToken(UUID userId, List<RoleCode> roles) {}
}
