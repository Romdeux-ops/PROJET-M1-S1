package com.fitcoach.common.security;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_ROUTES = {
        "/api/auth/**",
        "/actuator/health",
        "/actuator/health/**",
        "/actuator/info",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/uploads/avatars/**",
        "/api/programs/shared/**",
        // Le conteneur y redirige les erreurs non traitees : protegee, elle transformait toute 500 en 401.
        "/error"
    };

    private static final String COACH = RoleCode.COACH.name();
    private static final String ATHLETE = RoleCode.ATHLETE.name();
    private static final String ADMIN = RoleCode.ADMIN.name();

    private final String[] allowedOrigins;

    public SecurityConfig(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Roles verifies ici, avant la lecture du corps : avec @PreAuthorize seul, un corps
                // invalide etait valide d'abord (400 avec la liste des champs au lieu de 403).
                // Les @PreAuthorize des controleurs restent en defense en profondeur.
                .authorizeHttpRequests(auth -> auth.requestMatchers(PUBLIC_ROUTES)
                        .permitAll()
                        // Profil public d'un coach (page ouverte via le QR code) : lisible sans compte.
                        .requestMatchers(HttpMethod.GET, "/api/coaching/public/coaches/*")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/booking/bookings")
                        .hasAuthority(ATHLETE)
                        .requestMatchers(HttpMethod.POST, "/api/booking/slots")
                        .hasAuthority(COACH)
                        .requestMatchers(HttpMethod.POST, "/api/catalog/exercises")
                        .hasAnyAuthority(COACH, ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/catalog/exercises/*")
                        .hasAnyAuthority(COACH, ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/coaching/athletes", "/api/coaching/athletes/*/notes")
                        .hasAuthority(COACH)
                        .requestMatchers(HttpMethod.PUT, "/api/coaching/athletes/*/notes/*")
                        .hasAuthority(COACH)
                        .requestMatchers(HttpMethod.POST, "/api/coaching/posts", "/api/coaching/posts/images")
                        .hasAuthority(COACH)
                        .anyRequest()
                        .authenticated())
                .exceptionHandling(eh -> eh.authenticationEntryPoint(SecurityProblemResponses.authenticationEntryPoint())
                        .accessDeniedHandler(SecurityProblemResponses.accessDeniedHandler()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService) {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        // Lu par le client pour ne deconnecter que sur un vrai 401 d'authentification.
        configuration.setExposedHeaders(List.of(HttpHeaders.WWW_AUTHENTICATE));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
