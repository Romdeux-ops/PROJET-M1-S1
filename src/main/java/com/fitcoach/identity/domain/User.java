package com.fitcoach.identity.domain;

import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.api.Emails;
import com.fitcoach.identity.api.UserSummary;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Compte utilisateur (table {@code users}, V1 + V2).
 *
 * <p>Les preferences (unites, langue, objectif, niveau, statut) portent des
 * valeurs par defaut cote Java qui reproduisent les defauts SQL : elles
 * doivent rester synchronisees avec {@code V1__init.sql} tant qu'Hibernate
 * tourne en {@code ddl-auto: validate} et ne lit jamais les defauts DB.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, columnDefinition = "citext")
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column
    private String bio;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "fitness_goal", nullable = false)
    private String fitnessGoal = "GENERAL_FITNESS";

    @Column(name = "experience_level", nullable = false)
    private String experienceLevel = "BEGINNER";

    @Column(name = "unit_system", nullable = false)
    private String unitSystem = "METRIC";

    @Column(nullable = false)
    private String locale = "fr";

    @Column(name = "notifications_enabled", nullable = false)
    private boolean notificationsEnabled = true;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role_code")
    @Enumerated(EnumType.STRING)
    private Set<RoleCode> roles = new HashSet<>();

    protected User() {
        // JPA
    }

    public User(String email, String passwordHash, String firstName, String lastName) {
        this.email = Emails.normalize(email);
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public BigDecimal getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(BigDecimal heightCm) {
        this.heightCm = heightCm;
    }

    public String getFitnessGoal() {
        return fitnessGoal;
    }

    public void setFitnessGoal(String fitnessGoal) {
        this.fitnessGoal = fitnessGoal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getUnitSystem() {
        return unitSystem;
    }

    public void setUnitSystem(String unitSystem) {
        this.unitSystem = unitSystem;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getStatus() {
        return status;
    }

    public Set<RoleCode> getRoles() {
        return roles;
    }

    public void addRole(RoleCode role) {
        roles.add(role);
    }

    public boolean hasRole(RoleCode role) {
        return roles.contains(role);
    }

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public UserSummary toSummary() {
        return new UserSummary(id, email, firstName, lastName, roles.stream().sorted().toList(), avatarUrl);
    }
}
