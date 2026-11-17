package com.fitcoach.gamification.service;

import com.fitcoach.common.security.RoleCode;
import com.fitcoach.gamification.api.Achievements;
import com.fitcoach.gamification.domain.Badge;
import com.fitcoach.gamification.domain.UserBadge;
import com.fitcoach.gamification.dto.BadgeResponse;
import com.fitcoach.gamification.dto.GamificationProfileResponse;
import com.fitcoach.gamification.dto.LeaderboardEntryResponse;
import com.fitcoach.gamification.repository.BadgeRepository;
import com.fitcoach.gamification.repository.GamificationQueries;
import com.fitcoach.gamification.repository.GamificationQueries.Counters;
import com.fitcoach.gamification.repository.GamificationQueries.XpTotal;
import com.fitcoach.gamification.repository.UserBadgeRepository;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Badges et experience d'un athlete.
 *
 * <p>L'experience se derive des faits (seances, series, records, seances
 * planifiees terminees) ; seuls les badges decernes sont persistes, car un
 * badge gagne le reste meme si la metrique redescend ensuite.
 */
@Service
@Transactional(readOnly = true)
public class GamificationService implements Achievements {

    public static final int LEADERBOARD_SIZE = 20;
    private static final int XP_PER_LEVEL_UNIT = 50;

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final GamificationQueries queries;
    private final UserDirectory userDirectory;
    private final Clock clock;

    public GamificationService(
            BadgeRepository badgeRepository,
            UserBadgeRepository userBadgeRepository,
            GamificationQueries queries,
            UserDirectory userDirectory,
            Clock clock) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.queries = queries;
        this.userDirectory = userDirectory;
        this.clock = clock;
    }

    /** Niveau L des que l'experience atteint {@code 50 * (L-1)^2} : 0, 50, 200, 450... */
    public static int levelOf(long xp) {
        return 1 + (int) Math.floor(Math.sqrt((double) xp / XP_PER_LEVEL_UNIT));
    }

    public static long xpForLevel(int level) {
        return (long) XP_PER_LEVEL_UNIT * (level - 1) * (level - 1);
    }

    public List<BadgeResponse> catalog() {
        return badgeRepository.findAllByOrderByPosition().stream()
                .map(badge -> BadgeResponse.from(badge, null))
                .toList();
    }

    @Transactional
    public GamificationProfileResponse profile(UUID userId) {
        evaluate(userId);
        Map<UUID, Instant> awarded = userBadgeRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(UserBadge::getBadgeId, UserBadge::getAwardedAt));
        List<BadgeResponse> badges = badgeRepository.findAllByOrderByPosition().stream()
                .map(badge -> BadgeResponse.from(badge, awarded.get(badge.getId())))
                .toList();
        long xp = queries.xpOf(userId);
        int level = levelOf(xp);
        return new GamificationProfileResponse(xp, level, xpForLevel(level), xpForLevel(level + 1), badges);
    }

    /**
     * Les meilleurs athletes ; un athlete hors du top voit quand meme son
     * propre rang, en derniere ligne.
     */
    public List<LeaderboardEntryResponse> leaderboard(UUID viewerId) {
        List<XpTotal> top = queries.topXp(LEADERBOARD_SIZE);
        List<LeaderboardEntryResponse> entries = new ArrayList<>();
        Map<UUID, UserSummary> users = new HashMap<>();
        users.putAll(userDirectory.findAllById(top.stream().map(XpTotal::userId).toList()));

        for (int i = 0; i < top.size(); i++) {
            entries.add(entry(i + 1, top.get(i), viewerId, users));
        }
        boolean viewerInTop = top.stream().anyMatch(total -> total.userId().equals(viewerId));
        if (!viewerInTop) {
            long viewerXp = queries.xpOf(viewerId);
            Optional<UserSummary> viewer = userDirectory.findById(viewerId);
            if (viewerXp > 0 && viewer.map(u -> u.hasRole(RoleCode.ATHLETE)).orElse(false)) {
                users.put(viewerId, viewer.get());
                entries.add(entry((int) queries.rankOf(viewerXp), new XpTotal(viewerId, viewerXp), viewerId, users));
            }
        }
        return entries;
    }

    private static LeaderboardEntryResponse entry(
            int rank, XpTotal total, UUID viewerId, Map<UUID, UserSummary> users) {
        UserSummary user = users.get(total.userId());
        return new LeaderboardEntryResponse(
                rank,
                total.userId(),
                user == null ? "" : user.displayName(),
                total.xp(),
                levelOf(total.xp()),
                total.userId().equals(viewerId));
    }

    @Override
    @Transactional
    public void evaluate(UUID userId) {
        Counters counters = queries.counters(userId);
        int longestStreak = longestStreak(queries.trainingDays(userId, clock.getZone()));
        Set<UUID> alreadyEarned =
                userBadgeRepository.findByUserId(userId).stream().map(UserBadge::getBadgeId).collect(Collectors.toSet());

        for (Badge badge : badgeRepository.findAllByOrderByPosition()) {
            if (!alreadyEarned.contains(badge.getId()) && isEarned(badge, counters, longestStreak)) {
                userBadgeRepository.awardIfAbsent(userId, badge.getId());
            }
        }
    }

    private static boolean isEarned(Badge badge, Counters counters, int longestStreak) {
        long value =
                switch (badge.getCode()) {
                    case "FIRST_SESSION", "SESSIONS_10", "SESSIONS_50" -> counters.sessions();
                    case "FIRST_PROGRAM" -> counters.programs();
                    case "STREAK_7", "STREAK_30" -> longestStreak;
                    case "FIRST_PR", "PRS_10" -> counters.records();
                    default -> 0;
                };
        return value >= badge.getThreshold();
    }

    /** Plus longue suite de jours consecutifs dans une liste de dates triee par ordre croissant. */
    static int longestStreak(List<LocalDate> days) {
        int longest = 0;
        int current = 0;
        LocalDate previous = null;
        for (LocalDate day : days) {
            current = previous != null && previous.plusDays(1).equals(day) ? current + 1 : 1;
            longest = Math.max(longest, current);
            previous = day;
        }
        return longest;
    }
}
