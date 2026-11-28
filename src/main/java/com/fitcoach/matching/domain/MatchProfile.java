package com.fitcoach.matching.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Profil FitMatch d'un utilisateur (table {@code match_profiles}, V19).
 *
 * <p>Ne contient que ce qui est propre a la rencontre ; prenom, age, taille,
 * objectif et niveau restent dans le compte.
 */
@Entity
@Table(name = "match_profiles")
public class MatchProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private MatchSide side;

    @Column(nullable = false)
    private String headline;

    @Column
    private String about;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false, columnDefinition = "text[]")
    private List<String> sports = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false, columnDefinition = "text[]")
    private List<String> goals = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false, columnDefinition = "text[]")
    private List<String> levels = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(nullable = false, columnDefinition = "text[]")
    private List<String> availability = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "training_mode", nullable = false)
    private TrainingMode trainingMode;

    @Column
    private String city;

    @Column(name = "max_budget_eur")
    private Integer maxBudgetEur;

    @Column(name = "session_rate_eur")
    private Integer sessionRateEur;

    @Column(nullable = false)
    private boolean visible = true;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    protected MatchProfile() {
        // JPA
    }

    public MatchProfile(UUID userId, MatchSide side) {
        this.userId = userId;
        this.side = side;
    }

    public UUID getUserId() {
        return userId;
    }

    public MatchSide getSide() {
        return side;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public List<String> getSports() {
        return sports;
    }

    public void setSports(List<String> sports) {
        this.sports = new ArrayList<>(sports);
    }

    public List<String> getGoals() {
        return goals;
    }

    public void setGoals(List<String> goals) {
        this.goals = new ArrayList<>(goals);
    }

    public List<String> getLevels() {
        return levels;
    }

    public void setLevels(List<String> levels) {
        this.levels = new ArrayList<>(levels);
    }

    public List<String> getAvailability() {
        return availability;
    }

    public void setAvailability(List<String> availability) {
        this.availability = new ArrayList<>(availability);
    }

    public TrainingMode getTrainingMode() {
        return trainingMode;
    }

    public void setTrainingMode(TrainingMode trainingMode) {
        this.trainingMode = trainingMode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getMaxBudgetEur() {
        return maxBudgetEur;
    }

    public void setMaxBudgetEur(Integer maxBudgetEur) {
        this.maxBudgetEur = maxBudgetEur;
    }

    public Integer getSessionRateEur() {
        return sessionRateEur;
    }

    public void setSessionRateEur(Integer sessionRateEur) {
        this.sessionRateEur = sessionRateEur;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
