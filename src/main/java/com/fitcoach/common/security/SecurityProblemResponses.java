package com.fitcoach.common.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import tools.jackson.databind.json.JsonMapper;

/**
 * 401 et 403 emis par la chaine de securite, au meme format ProblemDetail que
 * {@code ApiExceptionHandler}. Le statut est ecrit directement : un
 * {@code sendError} repasserait par /error et perdrait le corps.
 *
 * <p>Seul le 401 du filtre porte {@code WWW-Authenticate: Bearer} : le client
 * s'en sert pour distinguer une session expiree d'un simple refus metier
 * (mauvais mot de passe au login, par exemple).
 */
final class SecurityProblemResponses {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private SecurityProblemResponses() {}

    static AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, ex) -> {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
            write(request, response, HttpStatus.UNAUTHORIZED, "Authentification requise.");
        };
    }

    static AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) ->
                write(request, response, HttpStatus.FORBIDDEN, "Vous n'avez pas les droits pour cette action.");
    }

    private static void write(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String detail)
            throws IOException {
        Map<String, Object> problem = new LinkedHashMap<>();
        problem.put("type", "about:blank");
        problem.put("title", status.getReasonPhrase());
        problem.put("status", status.value());
        problem.put("detail", detail);
        problem.put("instance", request.getRequestURI());
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        MAPPER.writeValue(response.getOutputStream(), problem);
    }
}
