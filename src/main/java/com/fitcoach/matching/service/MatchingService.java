package com.fitcoach.matching.service;

import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.api.ProfileSnapshot;
import com.fitcoach.identity.api.UserProfiles;
import com.fitcoach.matching.api.MatchRelations;
import com.fitcoach.matching.domain.Compatibility;
import com.fitcoach.matching.domain.Match;
import com.fitcoach.matching.domain.MatchProfile;
import com.fitcoach.matching.domain.MatchSide;
import com.fitcoach.matching.domain.MatchStatus;
import com.fitcoach.matching.dto.CandidateResponse;
import com.fitcoach.matching.dto.MatchProfileRequest;
import com.fitcoach.matching.dto.MatchResponse;
import com.fitcoach.matching.dto.MyMatchProfileResponse;
import com.fitcoach.matching.dto.SwipeRequest;
import com.fitcoach.matching.dto.SwipeResponse;
import com.fitcoach.matching.exception.AgeRequirementException;
import com.fitcoach.matching.exception.InvalidSwipeTargetException;
import com.fitcoach.matching.exception.MatchNotFoundException;
import com.fitcoach.matching.exception.MatchProfileNotFoundException;
import com.fitcoach.matching.exception.MatchProfileRequiredException;
import com.fitcoach.matching.repository.MatchProfileRepository;
import com.fitcoach.matching.repository.MatchRepository;
import com.fitcoach.matching.repository.MatchSwipeRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Profils, fil, swipes et matchs FitMatch.
 *
 * <p>Un athlete ne voit et ne swipe que des coachs, et inversement. Deux
 * decisions positives reciproques (LIKE ou SUPER_LIKE) creent le match ; un
 * match termine ne se recree pas.
 */
@Service
@Transactional(readOnly = true)
public class MatchingService implements MatchRelations {

    public static final int MINIMUM_AGE = 16;
    public static final int DEFAULT_FEED_SIZE = 20;
    public static final int MAX_FEED_SIZE = 50;

    /** Profils lus avant le tri par score : le fil n'a pas besoin d'etre exhaustif. */
    static final int FEED_POOL_SIZE = 200;

    private final MatchProfileRepository profileRepository;
    private final MatchSwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    private final UserProfiles userProfiles;
    private final Clock clock;

    public MatchingService(
            MatchProfileRepository profileRepository,
            MatchSwipeRepository swipeRepository,
            MatchRepository matchRepository,
            UserProfiles userProfiles,
            Clock clock) {
        this.profileRepository = profileRepository;
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
        this.userProfiles = userProfiles;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- profil

    public MyMatchProfileResponse getProfile(UUID userId) {
        return toMyProfile(userProfiles.get(userId), profileRepository.findById(userId));
    }

    /** Cree ou remplace le profil FitMatch, en completant le compte si besoin. */
    @Transactional
    public MyMatchProfileResponse saveProfile(UUID userId, MatchProfileRequest request) {
        ProfileSnapshot account = userProfiles.get(userId);
        LocalDate birthDate = request.birthDate() != null ? request.birthDate() : account.birthDate();
        if (birthDate == null || ageOf(birthDate) < MINIMUM_AGE) {
            throw new AgeRequirementException(MINIMUM_AGE);
        }
        if (request.birthDate() != null || request.heightCm() != null) {
            account = userProfiles.complete(userId, request.birthDate(), request.heightCm());
        }

        MatchSide side = sideOf(account);
        MatchProfile profile = profileRepository.findById(userId).orElseGet(() -> new MatchProfile(userId, side));
        boolean coach = profile.getSide() == MatchSide.COACH;

        profile.setHeadline(request.headline().strip());
        profile.setAbout(blankToNull(request.about()));
        profile.setSports(distinct(request.sports()));
        profile.setGoals(coach ? distinct(request.goals()) : List.of());
        profile.setLevels(coach ? distinct(request.levels()) : List.of());
        profile.setAvailability(distinct(request.availability()));
        profile.setTrainingMode(request.trainingMode());
        profile.setCity(blankToNull(request.city()));
        profile.setMaxBudgetEur(coach ? null : request.maxBudgetEur());
        profile.setSessionRateEur(coach ? request.sessionRateEur() : null);
        profile.setVisible(request.visible() == null || request.visible());

        return toMyProfile(account, Optional.of(profileRepository.saveAndFlush(profile)));
    }

    // ------------------------------------------------------------------ fil

    /**
     * Profils du camp oppose pas encore swipes, les SUPER_LIKE recus d'abord,
     * puis par score decroissant. {@code limit} est ramene entre 1 et
     * {@value #MAX_FEED_SIZE}.
     */
    public List<CandidateResponse> feed(UUID viewerId, Integer limit) {
        int size = Math.clamp(limit == null ? DEFAULT_FEED_SIZE : limit, 1, MAX_FEED_SIZE);
        MatchProfile me = profileRepository.findById(viewerId).orElseThrow(MatchProfileRequiredException::new);
        ProfileSnapshot myAccount = userProfiles.get(viewerId);

        List<MatchProfile> pool =
                profileRepository.findFeedCandidates(viewerId, me.getSide().opposite().name(), FEED_POOL_SIZE);
        if (pool.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = pool.stream().map(MatchProfile::getUserId).toList();
        Map<UUID, ProfileSnapshot> accounts = userProfiles.findAll(ids);
        Set<UUID> superLikers = new HashSet<>(swipeRepository.findSuperLikers(viewerId, ids));

        return pool.stream()
                .filter(p -> isActive(accounts.get(p.getUserId())))
                .map(p -> toCandidate(me, myAccount, p, accounts.get(p.getUserId()), superLikers))
                .sorted(Comparator.comparing(CandidateResponse::superLikedYou)
                        .thenComparingInt(CandidateResponse::score)
                        .reversed())
                .limit(size)
                .toList();
    }

    // --------------------------------------------------------------- swipes

    @Transactional
    public SwipeResponse swipe(UUID viewerId, SwipeRequest request) {
        MatchProfile me = profileRepository.findById(viewerId).orElseThrow(MatchProfileRequiredException::new);
        UUID targetId = request.targetId();
        if (targetId.equals(viewerId)) {
            throw new InvalidSwipeTargetException();
        }
        MatchProfile target = profileRepository
                .findById(targetId)
                .filter(MatchProfile::isVisible)
                .orElseThrow(MatchProfileNotFoundException::new);
        if (target.getSide() == me.getSide()) {
            throw new InvalidSwipeTargetException();
        }
        ProfileSnapshot targetAccount = userProfiles.get(targetId);
        if (!targetAccount.active()) {
            throw new MatchProfileNotFoundException();
        }

        UUID coachId = me.getSide() == MatchSide.COACH ? viewerId : targetId;
        UUID athleteId = me.getSide() == MatchSide.COACH ? targetId : viewerId;

        swipeRepository.lockPair(coachId + ":" + athleteId);
        swipeRepository.upsert(viewerId, targetId, request.decision().name());
        boolean created = request.decision().isPositive()
                && swipeRepository.hasLiked(targetId, viewerId)
                && matchRepository.insertIfAbsent(coachId, athleteId) == 1;

        MatchResponse match = matchRepository
                .findByCoachIdAndAthleteId(coachId, athleteId)
                .filter(m -> m.getStatus() == MatchStatus.ACTIVE)
                .map(m -> toMatch(viewerId, m, target, targetAccount))
                .orElse(null);
        return new SwipeResponse(request.decision(), match, created);
    }

    // --------------------------------------------------------------- matchs

    public List<MatchResponse> listMatches(UUID userId) {
        List<Match> matches = matchRepository.findActiveForParticipant(userId);
        if (matches.isEmpty()) {
            return List.of();
        }
        List<UUID> counterparts = matches.stream().map(m -> m.counterpartOf(userId)).toList();
        Map<UUID, MatchProfile> profiles = profileRepository.findAllById(counterparts).stream()
                .collect(Collectors.toMap(MatchProfile::getUserId, Function.identity()));
        Map<UUID, ProfileSnapshot> accounts = userProfiles.findAll(counterparts);

        List<MatchResponse> responses = new ArrayList<>();
        for (Match match : matches) {
            UUID counterpart = match.counterpartOf(userId);
            ProfileSnapshot account = accounts.get(counterpart);
            if (account != null) {
                responses.add(toMatch(userId, match, profiles.get(counterpart), account));
            }
        }
        return responses;
    }

    /** Termine le match : la conversation reste lisible mais l'envoi de messages est ferme. */
    @Transactional
    public void unmatch(UUID userId, UUID matchId) {
        Match match = matchRepository
                .findById(matchId)
                .filter(m -> m.involves(userId) && m.getStatus() == MatchStatus.ACTIVE)
                .orElseThrow(MatchNotFoundException::new);
        match.end(clock.instant().truncatedTo(ChronoUnit.MICROS));
    }

    @Override
    public boolean isActiveMatch(UUID coachId, UUID athleteId) {
        return matchRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, MatchStatus.ACTIVE);
    }

    // ------------------------------------------------------------ conversion

    private MyMatchProfileResponse toMyProfile(ProfileSnapshot account, Optional<MatchProfile> profile) {
        List<String> missing = new ArrayList<>();
        if (account.birthDate() == null) missing.add("BIRTH_DATE");
        if (account.heightCm() == null) missing.add("HEIGHT");
        return new MyMatchProfileResponse(
                profile.map(MatchProfile::getSide).orElseGet(() -> sideOf(account)),
                account.firstName(),
                account.avatarUrl(),
                account.birthDate(),
                ageOrNull(account.birthDate()),
                account.heightCm(),
                account.fitnessGoal(),
                account.experienceLevel(),
                List.copyOf(missing),
                profile.map(MyMatchProfileResponse.Details::from).orElse(null));
    }

    private CandidateResponse toCandidate(
            MatchProfile me,
            ProfileSnapshot myAccount,
            MatchProfile candidate,
            ProfileSnapshot account,
            Set<UUID> superLikers) {
        Compatibility.Result compatibility = me.getSide() == MatchSide.ATHLETE
                ? Compatibility.between(me, myAccount.fitnessGoal(), myAccount.experienceLevel(), candidate)
                : Compatibility.between(candidate, account.fitnessGoal(), account.experienceLevel(), me);
        boolean coach = candidate.getSide() == MatchSide.COACH;
        return new CandidateResponse(
                candidate.getUserId(),
                candidate.getSide(),
                account.firstName(),
                ageOrNull(account.birthDate()),
                account.heightCm(),
                account.avatarUrl(),
                candidate.getHeadline(),
                candidate.getAbout(),
                List.copyOf(candidate.getSports()),
                coach ? List.copyOf(candidate.getGoals()) : List.of(account.fitnessGoal()),
                coach ? List.copyOf(candidate.getLevels()) : List.of(account.experienceLevel()),
                List.copyOf(candidate.getAvailability()),
                candidate.getTrainingMode(),
                candidate.getCity(),
                coach ? candidate.getSessionRateEur() : null,
                compatibility.score(),
                compatibility.reasons(),
                superLikers.contains(candidate.getUserId()));
    }

    private MatchResponse toMatch(UUID viewerId, Match match, MatchProfile counterpart, ProfileSnapshot account) {
        return new MatchResponse(
                match.getId(),
                match.counterpartOf(viewerId),
                match.getCoachId().equals(viewerId) ? MatchSide.ATHLETE : MatchSide.COACH,
                account.firstName(),
                ageOrNull(account.birthDate()),
                account.avatarUrl(),
                counterpart == null ? null : counterpart.getHeadline(),
                counterpart == null ? List.of() : List.copyOf(counterpart.getSports()),
                match.getCreatedAt());
    }

    private static MatchSide sideOf(ProfileSnapshot account) {
        return account.hasRole(RoleCode.COACH) ? MatchSide.COACH : MatchSide.ATHLETE;
    }

    private static boolean isActive(ProfileSnapshot account) {
        return account != null && account.active();
    }

    private int ageOf(LocalDate birthDate) {
        return Period.between(birthDate, LocalDate.now(clock)).getYears();
    }

    private Integer ageOrNull(LocalDate birthDate) {
        return birthDate == null ? null : ageOf(birthDate);
    }

    private static List<String> distinct(List<String> values) {
        return values == null ? List.of() : values.stream().distinct().toList();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
