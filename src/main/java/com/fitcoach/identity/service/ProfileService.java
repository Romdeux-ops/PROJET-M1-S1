package com.fitcoach.identity.service;

import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.dto.ProfileResponse;
import com.fitcoach.identity.dto.UpdateProfileRequest;
import com.fitcoach.identity.repository.UserRepository;
import java.util.UUID;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final AvatarStorageService avatarStorageService;

    public ProfileService(UserRepository userRepository, AvatarStorageService avatarStorageService) {
        this.userRepository = userRepository;
        this.avatarStorageService = avatarStorageService;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        return ProfileResponse.from(findUser(userId));
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        if (request.firstName() != null) user.setFirstName(request.firstName());
        if (request.lastName() != null) user.setLastName(request.lastName());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.birthDate() != null) user.setBirthDate(request.birthDate());
        if (request.heightCm() != null) user.setHeightCm(request.heightCm());
        if (request.fitnessGoal() != null) user.setFitnessGoal(request.fitnessGoal());
        if (request.experienceLevel() != null) user.setExperienceLevel(request.experienceLevel());
        if (request.unitSystem() != null) user.setUnitSystem(request.unitSystem());
        if (request.locale() != null) user.setLocale(request.locale());
        if (request.notificationsEnabled() != null) user.setNotificationsEnabled(request.notificationsEnabled());
        return ProfileResponse.from(user);
    }

    @Transactional
    public String updateAvatar(UUID userId, MultipartFile file) {
        User user = findUser(userId);
        String avatarUrl = avatarStorageService.store(userId, file);
        user.setAvatarUrl(avatarUrl);
        return avatarUrl;
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException(userId.toString()));
    }
}
