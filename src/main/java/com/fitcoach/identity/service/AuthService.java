package com.fitcoach.identity.service;

import com.fitcoach.common.security.JwtService;
import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.dto.AuthResponse;
import com.fitcoach.identity.dto.LoginRequest;
import com.fitcoach.identity.dto.RegisterRequest;
import com.fitcoach.identity.dto.UserResponse;
import com.fitcoach.identity.exception.AccountDisabledException;
import com.fitcoach.identity.exception.EmailAlreadyUsedException;
import com.fitcoach.identity.exception.InvalidCredentialsException;
import com.fitcoach.identity.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException(request.email());
        }
        // L'inscription publique n'ouvre jamais le role ADMIN.
        RoleCode role = request.role() == RoleCode.ADMIN ? RoleCode.ATHLETE : request.role();

        User user = new User(
                request.email(), passwordEncoder.encode(request.password()), request.firstName(), request.lastName());
        user.addRole(role);
        userRepository.save(user);

        return new AuthResponse(issueToken(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        if (!user.isActive()) {
            throw new AccountDisabledException();
        }
        return new AuthResponse(issueToken(user), UserResponse.from(user));
    }

    private String issueToken(User user) {
        return jwtService.generateToken(
                user.getId(), user.getEmail(), user.getRoles().stream().map(Enum::name).toList());
    }
}
