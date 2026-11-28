package com.fitcoach.identity.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "body_weight_entries",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"user_id", "measured_on"}
        )
    }
)
public class BodyWeightEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
        name = "weight_kg",
        nullable = false,
        precision = 5,
        scale = 2
    )
    private BigDecimal weightKg;

    @Column(name = "measured_on", nullable = false)
    private LocalDate measuredOn;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private Instant createdAt;

    protected BodyWeightEntry() {
    }

    public BodyWeightEntry(
            UUID userId,
            BigDecimal weightKg,
            LocalDate measuredOn,
            String note
    ) {
        this.userId = userId;
        this.weightKg = weightKg;
        this.measuredOn = measuredOn;
        this.note = note;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
    }

    public LocalDate getMeasuredOn() {
        return measuredOn;
    }

    public void setMeasuredOn(LocalDate measuredOn) {
        this.measuredOn = measuredOn;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}