package com.fitcoach.identity.service;

import com.fitcoach.identity.api.UserNotFoundException;
import com.fitcoach.identity.domain.BodyWeightEntry;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.dto.BodyWeightRequest;
import com.fitcoach.identity.dto.BodyWeightResponse;
import com.fitcoach.identity.dto.ProfileResponse;
import com.fitcoach.identity.dto.UpdateProfileRequest;
import com.fitcoach.identity.exception.InvalidBodyWeightException;
import com.fitcoach.identity.repository.BodyWeightEntryRepository;
import com.fitcoach.identity.repository.UserRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final AvatarStorageService avatarStorageService;
    private final BodyWeightEntryRepository bodyWeightEntryRepository;
    private final Clock clock;

    public ProfileService(
            UserRepository userRepository,
            AvatarStorageService avatarStorageService,
            BodyWeightEntryRepository bodyWeightEntryRepository,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.avatarStorageService = avatarStorageService;
        this.bodyWeightEntryRepository = bodyWeightEntryRepository;
        this.clock = clock;
    }

    // ==========================================
    // Gestion du profil existante
    // ==========================================

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        return ProfileResponse.from(findUser(userId));
    }

    @Transactional
    public ProfileResponse updateProfile(
            UUID userId,
            UpdateProfileRequest request
    ) {

        User user = findUser(userId);

        if (request.firstName() != null)
            user.setFirstName(request.firstName().strip());

        if (request.lastName() != null)
            user.setLastName(request.lastName().strip());

        if (request.bio() != null)
            user.setBio(request.bio());

        if (request.birthDate() != null)
            user.setBirthDate(request.birthDate());

        if (request.heightCm() != null)
            user.setHeightCm(request.heightCm());

        if (request.fitnessGoal() != null)
            user.setFitnessGoal(request.fitnessGoal());

        if (request.experienceLevel() != null)
            user.setExperienceLevel(request.experienceLevel());

        if (request.unitSystem() != null)
            user.setUnitSystem(request.unitSystem());

        if (request.locale() != null)
            user.setLocale(request.locale());

        if (request.notificationsEnabled() != null)
            user.setNotificationsEnabled(
                    request.notificationsEnabled()
            );

        return ProfileResponse.from(user);
    }

    @Transactional
    public String updateAvatar(
            UUID userId,
            MultipartFile file
    ) {

        User user = findUser(userId);

        String avatarUrl =
                avatarStorageService.store(userId, file);

        user.setAvatarUrl(avatarUrl);

        return avatarUrl;
    }

    // ==========================================
    // Gestion du poids corporel
    // ==========================================

    @Transactional(readOnly = true)
    public List<BodyWeightResponse> getWeightHistory(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {

        findUser(userId);

        if (from.isAfter(to)) {
            throw new InvalidBodyWeightException(
                    "La date de debut doit preceder "
                    + "ou etre egale a la date de fin."
            );
        }

        return bodyWeightEntryRepository
                .findByUserIdAndMeasuredOnBetweenOrderByMeasuredOnAsc(
                        userId,
                        from,
                        to
                )
                .stream()
                .map(BodyWeightResponse::from)
                .toList();
    }

    @Transactional
    public BodyWeightResponse saveWeight(
            UUID userId,
            LocalDate measuredOn,
            BodyWeightRequest request
    ) {

        findUser(userId);

        validateWeightDate(measuredOn);

        BodyWeightEntry entry = bodyWeightEntryRepository
                .findByUserIdAndMeasuredOn(
                        userId,
                        measuredOn
                )
                .orElseGet(() -> new BodyWeightEntry(
                        userId,
                        request.weightKg(),
                        measuredOn,
                        request.note()
                ));

        entry.setWeightKg(request.weightKg());
        entry.setNote(request.note());

        BodyWeightEntry savedEntry =
                bodyWeightEntryRepository.save(entry);

        return BodyWeightResponse.from(savedEntry);
    }

    @Transactional
    public void deleteWeight(
            UUID userId,
            LocalDate measuredOn
    ) {

        findUser(userId);

        bodyWeightEntryRepository
                .findByUserIdAndMeasuredOn(
                        userId,
                        measuredOn
                )
                .ifPresent(bodyWeightEntryRepository::delete);
    }

    private void validateWeightDate(LocalDate measuredOn) {

        if (measuredOn.isAfter(LocalDate.now(clock))) {
            throw new InvalidBodyWeightException(
                    "Une mesure de poids ne peut pas "
                    + "etre enregistree dans le futur."
            );
        }
    }

    private User findUser(UUID userId) {

        return userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
    }
}