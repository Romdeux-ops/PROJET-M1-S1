package com.fitcoach.gamification.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/**
 * Definition d'un badge (table {@code badges}, V11), semee par la migration.
 *
 * <p>{@code threshold} est le seuil de la metrique visee (seances, jours de
 * streak, records...), interprete par le service selon le {@code code}.
 */
@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, updatable = false)
    private String code;

    @Column(nullable = false, updatable = false)
    private String name;

    @Column(nullable = false, updatable = false)
    private String description;

    @Column(nullable = false, updatable = false)
    private int threshold;

    @Column(nullable = false, updatable = false)
    private int position;

    protected Badge() {
        // JPA
    }

    public UUID getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getThreshold() {
        return threshold;
    }

    public int getPosition() {
        return position;
    }
}
