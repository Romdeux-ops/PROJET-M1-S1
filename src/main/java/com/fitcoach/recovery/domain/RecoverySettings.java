package com.fitcoach.recovery.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recovery_settings")
public class RecoverySettings {

    public static final int DEFAULT_SLEEP_TARGET_MINUTES = 480;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "sleep_target_minutes", nullable = false)
    private int sleepTargetMinutes = DEFAULT_SLEEP_TARGET_MINUTES;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected RecoverySettings() {
    }

    public RecoverySettings(UUID userId) {
        this.userId = userId;
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

    public UUID getUserId() {
        return userId;
    }

    public int getSleepTargetMinutes() {
        return sleepTargetMinutes;
    }

    public void setSleepTargetMinutes(int sleepTargetMinutes) {
        this.sleepTargetMinutes = sleepTargetMinutes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}