package com.fitcoach.identity.service;

import com.fitcoach.identity.api.ProfileSnapshot;
import com.fitcoach.identity.api.UserNotFoundException;
import com.fitcoach.identity.api.UserProfiles;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaUserProfiles implements UserProfiles {

    private final UserRepository userRepository;

    JpaUserProfiles(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public ProfileSnapshot get(UUID userId) {
        return snapshot(findUser(userId));
    }

    @Override
    public Map<UUID, ProfileSnapshot> findAll(Collection<UUID> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, JpaUserProfiles::snapshot));
    }

    @Override
    @Transactional
    public ProfileSnapshot complete(UUID userId, LocalDate birthDate, BigDecimal heightCm) {
        User user = findUser(userId);
        if (birthDate != null && user.getBirthDate() == null) user.setBirthDate(birthDate);
        if (heightCm != null && user.getHeightCm() == null) user.setHeightCm(heightCm);
        return snapshot(user);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
    }

    private static ProfileSnapshot snapshot(User user) {
        return new ProfileSnapshot(
                user.getId(),
                user.getFirstName(),
                user.getAvatarUrl(),
                user.getRoles().stream().sorted().toList(),
                user.getBirthDate(),
                user.getHeightCm(),
                user.getFitnessGoal(),
                user.getExperienceLevel(),
                user.isActive());
    }
}
