package com.fitcoach.identity.service;

import com.fitcoach.identity.api.AthleteWeight;
import com.fitcoach.identity.domain.BodyWeightEntry;
import com.fitcoach.identity.repository.BodyWeightEntryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class JpaAthleteWeight implements AthleteWeight {

    private final BodyWeightEntryRepository
            bodyWeightEntryRepository;

    public JpaAthleteWeight(
            BodyWeightEntryRepository bodyWeightEntryRepository
    ) {
        this.bodyWeightEntryRepository =
                bodyWeightEntryRepository;
    }

    @Override
    public Optional<Measurement> latestWeight(
            UUID athleteId
    ) {

        return bodyWeightEntryRepository
                .findFirstByUserIdOrderByMeasuredOnDesc(
                        athleteId
                )
                .map(this::toMeasurement);
    }

    @Override
    public Optional<Measurement> weightAt(
            UUID athleteId,
            LocalDate date
    ) {

        return bodyWeightEntryRepository
                .findFirstByUserIdAndMeasuredOnLessThanEqualOrderByMeasuredOnDesc(
                        athleteId,
                        date
                )
                .map(this::toMeasurement);
    }

    @Override
    public List<Measurement> weightHistory(
            UUID athleteId,
            LocalDate from,
            LocalDate to
    ) {

        return bodyWeightEntryRepository
                .findByUserIdAndMeasuredOnBetweenOrderByMeasuredOnAsc(
                        athleteId,
                        from,
                        to
                )
                .stream()
                .map(this::toMeasurement)
                .toList();
    }

    private Measurement toMeasurement(
            BodyWeightEntry entry
    ) {

        return new Measurement(
                entry.getWeightKg(),
                entry.getMeasuredOn()
        );
    }
}