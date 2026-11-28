package com.fitcoach.recovery.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "recovery_checkins",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_recovery_checkins_user_date",
            columnNames = {"user_id", "checkin_date"}
        )
    }
)
public class RecoveryCheckin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "energy_level", nullable = false)
    private int energyLevel;

    @Column(name = "fatigue_level", nullable = false)
    private int fatigueLevel;

    @Column(name = "stress_level", nullable = false)
    private int stressLevel;

    @Column(name = "muscle_soreness", nullable = false)
    private int muscleSoreness;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RecoveryCheckin() {
    }

    public RecoveryCheckin(
            UUID userId,
            LocalDate checkinDate,
            int energyLevel,
            int fatigueLevel,
            int stressLevel,
            int muscleSoreness,
            String notes
    ) {
        this.userId = userId;
        this.checkinDate = checkinDate;
        this.energyLevel = energyLevel;
        this.fatigueLevel = fatigueLevel;
        this.stressLevel = stressLevel;
        this.muscleSoreness = muscleSoreness;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
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

    public LocalDate getCheckinDate() {
        return checkinDate;
    }

    public int getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(int energyLevel) {
        this.energyLevel = energyLevel;
    }

    public int getFatigueLevel() {
        return fatigueLevel;
    }

    public void setFatigueLevel(int fatigueLevel) {
        this.fatigueLevel = fatigueLevel;
    }

    public int getStressLevel() {
        return stressLevel;
    }

    public void setStressLevel(int stressLevel) {
        this.stressLevel = stressLevel;
    }

    public int getMuscleSoreness() {
        return muscleSoreness;
    }

    public void setMuscleSoreness(int muscleSoreness) {
        this.muscleSoreness = muscleSoreness;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}