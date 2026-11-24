package com.fitcoach.identity;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fitcoach.common.security.JwtService;
import com.fitcoach.identity.dto.LoginRequest;
import com.fitcoach.identity.exception.InvalidCredentialsException;
import com.fitcoach.identity.repository.UserRepository;
import com.fitcoach.identity.service.AuthService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Un e-mail inconnu doit couter un calcul BCrypt, comme un mot de passe faux. */
class LoginTimingTests {

    @Test
    void unknownEmailStillRunsThePasswordCheck() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.findByEmail("inconnu@fitcoach.dev")).thenReturn(Optional.empty());
        AuthService authService = new AuthService(users, encoder, mock(JwtService.class));

        assertThatThrownBy(() -> authService.login(new LoginRequest("inconnu@fitcoach.dev", "Password1")))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(encoder, times(1)).matches(eq("Password1"), any());
    }
}
