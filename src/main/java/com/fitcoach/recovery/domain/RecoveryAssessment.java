package com.fitcoach.recovery.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
    name = "recovery_assessments",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_recovery_assessments_user_date",
            columnNames = {"user_id", "assessment_date"}
        )
    }
)
public class RecoveryAssessment {

    public static final String CURRENT_ALGORITHM_VERSION = "1.0";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "assessment_date", nullable = false)
    private LocalDate assessmentDate;

    // Scores principaux

    @Column(name = "sleep_score")
    private Integer sleepScore;

    @Column(name = "body_battery")
    private Integer bodyBattery;

    @Column(name = "training_readiness")
    private Integer trainingReadiness;

    // Activite sportive

    @Column(name = "training_load", precision = 10, scale = 2)
    private BigDecimal trainingLoad;

    @Column(name = "recent_training_load", precision = 10, scale = 2)
    private BigDecimal recentTrainingLoad;

    @Column(name = "active_calories_kcal", precision = 10, scale = 2)
    private BigDecimal activeCaloriesKcal;

    // Decomposition du Body Battery

    @Column(name = "previous_body_battery", precision = 5, scale = 2)
    private BigDecimal previousBodyBattery;

    @Column(name = "sleep_recharge", precision = 5, scale = 2)
    private BigDecimal sleepRecharge;

    @Column(name = "training_drain", precision = 10, scale = 2)
    private BigDecimal trainingDrain;

    @Column(name = "stress_drain", precision = 5, scale = 2)
    private BigDecimal stressDrain;

    @Column(name = "daily_drain", precision = 5, scale = 2)
    private BigDecimal dailyDrain;

    // Informations de calcul

    @Enumerated(EnumType.STRING)
    @Column(
        name = "data_status",
        nullable = false,
        columnDefinition = "text"
    )
    private RecoveryDataStatus dataStatus =
            RecoveryDataStatus.INSUFFICIENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation", columnDefinition = "text")
    private RecoveryRecommendation recommendation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
        name = "calculation_details",
        nullable = false,
        columnDefinition = "jsonb"
    )
    private Map<String, Object> calculationDetails =
            new LinkedHashMap<>();

    @Column(
        name = "algorithm_version",
        nullable = false,
        columnDefinition = "text"
    )
    private String algorithmVersion = CURRENT_ALGORITHM_VERSION;

    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RecoveryAssessment() {
    }

    public RecoveryAssessment(UUID userId, LocalDate assessmentDate) {
        this.userId = userId;
        this.assessmentDate = assessmentDate;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.calculatedAt == null) {
            this.calculatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public Integer getSleepScore() {
        return sleepScore;
    }

    public void setSleepScore(Integer sleepScore) {
        this.sleepScore = sleepScore;
    }

    public Integer getBodyBattery() {
        return bodyBattery;
    }

    public void setBodyBattery(Integer bodyBattery) {
        this.bodyBattery = bodyBattery;
    }

    public Integer getTrainingReadiness() {
        return trainingReadiness;
    }

    public void setTrainingReadiness(Integer trainingReadiness) {
        this.trainingReadiness = trainingReadiness;
    }

    public BigDecimal getTrainingLoad() {
        return trainingLoad;
    }

    public void setTrainingLoad(BigDecimal trainingLoad) {
        this.trainingLoad = trainingLoad;
    }

    public BigDecimal getRecentTrainingLoad() {
        return recentTrainingLoad;
    }

    public void setRecentTrainingLoad(BigDecimal recentTrainingLoad) {
        this.recentTrainingLoad = recentTrainingLoad;
    }

    public BigDecimal getActiveCaloriesKcal() {
        return activeCaloriesKcal;
    }

    public void setActiveCaloriesKcal(BigDecimal activeCaloriesKcal) {
        this.activeCaloriesKcal = activeCaloriesKcal;
    }

    public BigDecimal getPreviousBodyBattery() {
        return previousBodyBattery;
    }

    public void setPreviousBodyBattery(BigDecimal previousBodyBattery) {
        this.previousBodyBattery = previousBodyBattery;
    }

    public BigDecimal getSleepRecharge() {
        return sleepRecharge;
    }

    public void setSleepRecharge(BigDecimal sleepRecharge) {
        this.sleepRecharge = sleepRecharge;
    }

    public BigDecimal getTrainingDrain() {
        return trainingDrain;
    }

    public void setTrainingDrain(BigDecimal trainingDrain) {
        this.trainingDrain = trainingDrain;
    }

    public BigDecimal getStressDrain() {
        return stressDrain;
    }

    public void setStressDrain(BigDecimal stressDrain) {
        this.stressDrain = stressDrain;
    }

    public BigDecimal getDailyDrain() {
        return dailyDrain;
    }

    public void setDailyDrain(BigDecimal dailyDrain) {
        this.dailyDrain = dailyDrain;
    }

    public RecoveryDataStatus getDataStatus() {
        return dataStatus;
    }

    public void setDataStatus(RecoveryDataStatus dataStatus) {
        this.dataStatus = dataStatus;
    }

    public RecoveryRecommendation getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(
            RecoveryRecommendation recommendation
    ) {
        this.recommendation = recommendation;
    }

    public Map<String, Object> getCalculationDetails() {
        return calculationDetails;
    }

    public void setCalculationDetails(
            Map<String, Object> calculationDetails
    ) {
        this.calculationDetails = calculationDetails == null
                ? new LinkedHashMap<>()
                : new LinkedHashMap<>(calculationDetails);
    }

    public String getAlgorithmVersion() {
        return algorithmVersion;
    }

    public void setAlgorithmVersion(String algorithmVersion) {
        this.algorithmVersion = algorithmVersion;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}