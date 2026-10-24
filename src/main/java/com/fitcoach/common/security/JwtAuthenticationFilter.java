package com.fitcoach.common.security;

import com.fitcoach.identity.domain.RoleCode;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authentifie chaque requete a partir de l'en-tete {@code Authorization: Bearer <jwt>}.
 *
 * <p>Un jeton absent, invalide ou expire n'est jamais rejete ici : la requete
 * poursuit sans authentification, et c'est {@link SecurityConfig} qui refuse
 * ensuite l'acces aux routes protegees avec un 401.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX) && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                JwtService.ParsedToken parsed = jwtService.parse(header.substring(BEARER_PREFIX.length()));
                List<GrantedAuthority> authorities =
                        parsed.roles().stream().map(RoleCode::name).map(SimpleGrantedAuthority::new).map(GrantedAuthority.class::cast).toList();
                var authentication =
                        new UsernamePasswordAuthenticationToken(parsed.userId().toString(), null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException ignored) {
                // Jeton invalide : la requete continue non authentifiee.
            }
        }
        filterChain.doFilter(request, response);
    }
}
