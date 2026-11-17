package com.fitcoach.catalog.service;

import com.fitcoach.catalog.api.CatalogExercise;
import com.fitcoach.catalog.api.ExerciseCatalog;
import com.fitcoach.catalog.domain.Exercise;
import com.fitcoach.catalog.domain.ExerciseMuscle;
import com.fitcoach.catalog.domain.ExerciseTag;
import com.fitcoach.catalog.domain.MuscleGroup;
import com.fitcoach.catalog.domain.MuscleRole;
import com.fitcoach.catalog.domain.Tag;
import com.fitcoach.catalog.repository.ExerciseMuscleRepository;
import com.fitcoach.catalog.repository.ExerciseRepository;
import com.fitcoach.catalog.repository.ExerciseTagRepository;
import com.fitcoach.catalog.repository.MuscleGroupRepository;
import com.fitcoach.catalog.repository.TagRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class JpaExerciseCatalog implements ExerciseCatalog {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseMuscleRepository exerciseMuscleRepository;
    private final ExerciseTagRepository exerciseTagRepository;
    private final MuscleGroupRepository muscleGroupRepository;
    private final TagRepository tagRepository;

    JpaExerciseCatalog(
            ExerciseRepository exerciseRepository,
            ExerciseMuscleRepository exerciseMuscleRepository,
            ExerciseTagRepository exerciseTagRepository,
            MuscleGroupRepository muscleGroupRepository,
            TagRepository tagRepository) {
        this.exerciseRepository = exerciseRepository;
        this.exerciseMuscleRepository = exerciseMuscleRepository;
        this.exerciseTagRepository = exerciseTagRepository;
        this.muscleGroupRepository = muscleGroupRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public boolean exists(UUID exerciseId) {
        return exerciseRepository.existsById(exerciseId);
    }

    @Override
    public Map<UUID, String> namesOf(Collection<UUID> exerciseIds) {
        if (exerciseIds.isEmpty()) {
            return Map.of();
        }
        return exerciseRepository.findAllById(exerciseIds).stream()
                .collect(Collectors.toMap(Exercise::getId, Exercise::getName));
    }

    @Override
    public List<CatalogExercise> listAll() {
        List<Exercise> exercises = exerciseRepository.findAll();
        List<UUID> ids = exercises.stream().map(Exercise::getId).toList();
        Map<UUID, String> muscleNames = muscleGroupRepository.findAll().stream()
                .collect(Collectors.toMap(MuscleGroup::getId, MuscleGroup::getName));
        Map<UUID, String> tagNames =
                tagRepository.findAll().stream().collect(Collectors.toMap(Tag::getId, Tag::getName));
        Map<UUID, List<String>> primaryMuscles = exerciseMuscleRepository.findByExerciseIdIn(ids).stream()
                .filter(em -> em.getRole() == MuscleRole.PRIMARY)
                .collect(Collectors.groupingBy(
                        ExerciseMuscle::getExerciseId,
                        Collectors.mapping(em -> muscleNames.get(em.getMuscleGroupId()), Collectors.toList())));
        Map<UUID, List<String>> tags = exerciseTagRepository.findByExerciseIdIn(ids).stream()
                .collect(Collectors.groupingBy(
                        ExerciseTag::getExerciseId,
                        Collectors.mapping(et -> tagNames.get(et.getTagId()), Collectors.toList())));
        return exercises.stream()
                .map(e -> new CatalogExercise(
                        e.getId(),
                        e.getName(),
                        e.getDifficulty().name(),
                        primaryMuscles.getOrDefault(e.getId(), List.of()),
                        tags.getOrDefault(e.getId(), List.of())))
                .toList();
    }
}
