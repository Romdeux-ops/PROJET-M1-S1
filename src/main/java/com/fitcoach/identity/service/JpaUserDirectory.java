package com.fitcoach.identity.service;

import com.fitcoach.identity.api.Emails;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.repository.UserRepository;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaUserDirectory implements UserDirectory {

    private final UserRepository userRepository;

    JpaUserDirectory(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Optional<UserSummary> findById(UUID userId) {
        return userRepository.findById(userId).map(User::toSummary);
    }

    @Override
    public Map<UUID, UserSummary> findAllById(Collection<UUID> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::toSummary));
    }

    @Override
    public Optional<UserSummary> findByEmail(String email) {
        return userRepository.findByEmail(Emails.normalize(email)).map(User::toSummary);
    }

    @Override
    public boolean notificationsEnabled(UUID userId) {
        return userRepository.findById(userId).map(User::isNotificationsEnabled).orElse(true);
    }
}
