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

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "sleep_logs",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_sleep_logs_user_date",
            columnNames = {"user_id", "sleep_date"}
        )
    }
)
public class SleepLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "sleep_date", nullable = false)
    private LocalDate sleepDate;

    @Column(name = "bedtime", nullable = false)
    private Instant bedtime;

    @Column(name = "wake_time", nullable = false)
    private Instant wakeTime;

    @Column(name = "awake_minutes")
    private Integer awakeMinutes;

    @Column(name = "sleep_quality", nullable = false)
    private int sleepQuality;

    @Column(name = "night_awakenings")
    private Integer nightAwakenings;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SleepLog() {
    }

    public SleepLog(
            UUID userId,
            LocalDate sleepDate,
            Instant bedtime,
            Instant wakeTime,
            Integer awakeMinutes,
            int sleepQuality,
            Integer nightAwakenings,
            String notes
    ) {
        this.userId = userId;
        this.sleepDate = sleepDate;
        this.bedtime = bedtime;
        this.wakeTime = wakeTime;
        this.awakeMinutes = awakeMinutes;
        this.sleepQuality = sleepQuality;
        this.nightAwakenings = nightAwakenings;
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

    public long getTimeInBedMinutes() {
        return Duration.between(bedtime, wakeTime).toMinutes();
    }

    public long getEstimatedSleepMinutes() {
        long timeInBed = getTimeInBedMinutes();
        int awake = awakeMinutes == null ? 0 : awakeMinutes;

        return Math.max(0, timeInBed - awake);
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public LocalDate getSleepDate() {
        return sleepDate;
    }

    public void setSleepDate(LocalDate sleepDate) {
        this.sleepDate = sleepDate;
    }

    public Instant getBedtime() {
        return bedtime;
    }

    public void setBedtime(Instant bedtime) {
        this.bedtime = bedtime;
    }

    public Instant getWakeTime() {
        return wakeTime;
    }

    public void setWakeTime(Instant wakeTime) {
        this.wakeTime = wakeTime;
    }

    public Integer getAwakeMinutes() {
        return awakeMinutes;
    }

    public void setAwakeMinutes(Integer awakeMinutes) {
        this.awakeMinutes = awakeMinutes;
    }

    public int getSleepQuality() {
        return sleepQuality;
    }

    public void setSleepQuality(int sleepQuality) {
        this.sleepQuality = sleepQuality;
    }

    public Integer getNightAwakenings() {
        return nightAwakenings;
    }

    public void setNightAwakenings(Integer nightAwakenings) {
        this.nightAwakenings = nightAwakenings;
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