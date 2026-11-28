package com.fitcoach.recovery.repository;

import com.fitcoach.recovery.domain.RecoverySettings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RecoverySettingsRepository
        extends JpaRepository<RecoverySettings, UUID> {
}