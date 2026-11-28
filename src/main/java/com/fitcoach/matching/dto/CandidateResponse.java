package com.fitcoach.matching.dto;

import com.fitcoach.matching.domain.MatchSide;
import com.fitcoach.matching.domain.TrainingMode;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Carte du fil FitMatch. Seul le prenom est expose, jamais le nom ni l'email ;
 * le budget d'un athlete reste prive.
 *
 * <p>Pour un athlete, {@code goals} et {@code levels} contiennent l'objectif
 * et le niveau de son compte ; pour un coach, ceux qu'il prend en charge.
 *
 * @param reasons codes stables expliquant le score (voir {@code Compatibility})
 * @param superLikedYou vrai si cette personne vous a deja envoye un SUPER_LIKE
 */
public record CandidateResponse(
        UUID userId,
        MatchSide side,
        String firstName,
        Integer age,
        BigDecimal heightCm,
        String avatarUrl,
        String headline,
        String about,
        List<String> sports,
        List<String> goals,
        List<String> levels,
        List<String> availability,
        TrainingMode trainingMode,
        String city,
        Integer sessionRateEur,
        int score,
        List<String> reasons,
        boolean superLikedYou) {}
