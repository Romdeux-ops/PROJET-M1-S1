package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachAthlete;
import com.fitcoach.coaching.domain.CoachPublicProfile;
import com.fitcoach.coaching.dto.PublicCoachProfileResponse;
import com.fitcoach.coaching.dto.PublicProfileSettingsResponse;
import com.fitcoach.coaching.dto.UpdatePublicProfileRequest;
import com.fitcoach.coaching.dto.ViewerStatus;
import com.fitcoach.coaching.exception.PublicProfileNotFoundException;
import com.fitcoach.coaching.repository.CoachAthleteRepository;
import com.fitcoach.coaching.repository.CoachPublicProfileRepository;
import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Profil public d'un coach : reglages par le coach, consultation par n'importe quel visiteur une fois publie. */
@Service
@Transactional(readOnly = true)
public class CoachProfileService {

    private final CoachPublicProfileRepository profileRepository;
    private final CoachAthleteRepository coachAthleteRepository;
    private final UserDirectory userDirectory;

    public CoachProfileService(
            CoachPublicProfileRepository profileRepository,
            CoachAthleteRepository coachAthleteRepository,
            UserDirectory userDirectory) {
        this.profileRepository = profileRepository;
        this.coachAthleteRepository = coachAthleteRepository;
        this.userDirectory = userDirectory;
    }

    public PublicProfileSettingsResponse getSettings(UUID coachId) {
        return profileRepository
                .findById(coachId)
                .map(CoachProfileService::toSettings)
                .orElseGet(() -> new PublicProfileSettingsResponse(false, null, null));
    }

    @Transactional
    public PublicProfileSettingsResponse updateSettings(UUID coachId, UpdatePublicProfileRequest request) {
        CoachPublicProfile profile = profileRepository.findById(coachId).orElseGet(() -> new CoachPublicProfile(coachId));
        profile.update(request.enabled(), request.headline(), request.bio());
        return toSettings(profileRepository.save(profile));
    }

    /** Profil visible de tous, 404 tant que le coach ne l'a pas publie (ou si le compte n'est pas un coach). */
    public PublicCoachProfileResponse getPublicProfile(UUID coachId, UUID viewerId) {
        UserSummary coach = requirePublicCoach(coachId);
        CoachPublicProfile profile = profileRepository.findById(coachId).orElseThrow(PublicProfileNotFoundException::new);
        return new PublicCoachProfileResponse(
                coach.id(),
                coach.firstName(),
                coach.lastName(),
                coach.avatarUrl(),
                profile.getHeadline(),
                profile.getBio(),
                viewerStatus(coachId, viewerId));
    }

    /** Verifie qu'un coach existe et a publie son profil ; sert aussi de garde aux demandes de suivi. */
    UserSummary requirePublicCoach(UUID coachId) {
        UserSummary coach = userDirectory
                .findById(coachId)
                .filter(user -> user.hasRole(RoleCode.COACH))
                .orElseThrow(PublicProfileNotFoundException::new);
        boolean published = profileRepository.findById(coachId).map(CoachPublicProfile::isEnabled).orElse(false);
        if (!published) {
            throw new PublicProfileNotFoundException();
        }
        return coach;
    }

    private ViewerStatus viewerStatus(UUID coachId, UUID viewerId) {
        if (viewerId == null) {
            return ViewerStatus.ANONYMOUS;
        }
        if (viewerId.equals(coachId)) {
            return ViewerStatus.SELF;
        }
        boolean athlete = userDirectory.findById(viewerId).map(user -> user.hasRole(RoleCode.ATHLETE)).orElse(false);
        if (!athlete) {
            return ViewerStatus.NOT_ATHLETE;
        }
        return coachAthleteRepository
                .findByCoachIdAndAthleteId(coachId, viewerId)
                .map(CoachProfileService::statusOf)
                .orElse(ViewerStatus.NONE);
    }

    private static ViewerStatus statusOf(CoachAthlete relation) {
        return switch (relation.getStatus()) {
            case ACTIVE -> ViewerStatus.ACTIVE;
            case REQUESTED -> ViewerStatus.REQUESTED;
            case PENDING -> ViewerStatus.INVITED;
            case DECLINED, ENDED -> ViewerStatus.NONE;
        };
    }

    private static PublicProfileSettingsResponse toSettings(CoachPublicProfile profile) {
        return new PublicProfileSettingsResponse(profile.isEnabled(), profile.getHeadline(), profile.getBio());
    }
}
