package com.fitcoach.catalog.service;

import com.fitcoach.catalog.domain.Exercise;
import com.fitcoach.catalog.domain.ExerciseAlternative;
import com.fitcoach.catalog.domain.ExerciseDifficulty;
import com.fitcoach.catalog.domain.ExerciseMuscle;
import com.fitcoach.catalog.domain.ExerciseTag;
import com.fitcoach.catalog.domain.MuscleGroup;
import com.fitcoach.catalog.domain.Tag;
import com.fitcoach.catalog.dto.ExerciseMuscleInput;
import com.fitcoach.catalog.dto.ExerciseMuscleResponse;
import com.fitcoach.catalog.dto.ExerciseRequest;
import com.fitcoach.catalog.dto.ExerciseResponse;
import com.fitcoach.catalog.dto.MuscleGroupResponse;
import com.fitcoach.catalog.dto.TagResponse;
import com.fitcoach.catalog.exception.ExerciseNotFoundException;
import com.fitcoach.catalog.exception.InvalidExerciseReferenceException;
import com.fitcoach.catalog.exception.NotCatalogManagerException;
import com.fitcoach.catalog.repository.ExerciseAlternativeRepository;
import com.fitcoach.catalog.repository.ExerciseMuscleRepository;
import com.fitcoach.catalog.repository.ExerciseRepository;
import com.fitcoach.catalog.repository.ExerciseTagRepository;
import com.fitcoach.catalog.repository.MuscleGroupRepository;
import com.fitcoach.catalog.repository.TagRepository;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseMuscleRepository exerciseMuscleRepository;
    private final ExerciseTagRepository exerciseTagRepository;
    private final ExerciseAlternativeRepository exerciseAlternativeRepository;
    private final MuscleGroupRepository muscleGroupRepository;
    private final TagRepository tagRepository;

    public CatalogService(
            ExerciseRepository exerciseRepository,
            ExerciseMuscleRepository exerciseMuscleRepository,
            ExerciseTagRepository exerciseTagRepository,
            ExerciseAlternativeRepository exerciseAlternativeRepository,
            MuscleGroupRepository muscleGroupRepository,
            TagRepository tagRepository) {
        this.exerciseRepository = exerciseRepository;
        this.exerciseMuscleRepository = exerciseMuscleRepository;
        this.exerciseTagRepository = exerciseTagRepository;
        this.exerciseAlternativeRepository = exerciseAlternativeRepository;
        this.muscleGroupRepository = muscleGroupRepository;
        this.tagRepository = tagRepository;
    }

    public List<MuscleGroupResponse> listMuscleGroups() {
        return muscleGroupRepository.findAll().stream().map(MuscleGroupResponse::from).toList();
    }

    public List<TagResponse> listTags() {
        return tagRepository.findAll().stream().map(TagResponse::from).toList();
    }

    public Page<ExerciseResponse> search(
            String query, UUID muscleGroupId, UUID tagId, ExerciseDifficulty difficulty, Pageable pageable) {
        String normalizedQuery = (query == null || query.isBlank()) ? "" : query.trim();
        Page<Exercise> page = exerciseRepository.search(normalizedQuery, muscleGroupId, tagId, difficulty, pageable);
        return new PageImpl<>(toResponseList(page.getContent()), pageable, page.getTotalElements());
    }

    public ExerciseResponse get(UUID exerciseId) {
        return toResponse(findOrThrow(exerciseId));
    }

    @Transactional
    public ExerciseResponse create(ExerciseRequest request, UUID createdBy) {
        Exercise exercise = new Exercise(generateUniqueSlug(request.name()), request.name(), createdBy);
        applyFields(exercise, request);
        exercise = exerciseRepository.save(exercise);
        replaceAssociations(exercise.getId(), request);
        return toResponse(exercise);
    }

    @Transactional
    public ExerciseResponse update(UUID exerciseId, ExerciseRequest request, UUID requesterId, boolean admin) {
        Exercise exercise = findOrThrow(exerciseId);
        requireOwnerOrAdmin(exercise, requesterId, admin);
        applyFields(exercise, request);
        replaceAssociations(exercise.getId(), request);
        return toResponse(exercise);
    }

    @Transactional
    public void delete(UUID exerciseId, UUID requesterId, boolean admin) {
        Exercise exercise = findOrThrow(exerciseId);
        requireOwnerOrAdmin(exercise, requesterId, admin);
        exerciseMuscleRepository.deleteByExerciseId(exercise.getId());
        exerciseTagRepository.deleteByExerciseId(exercise.getId());
        exerciseAlternativeRepository.deleteByExerciseId(exercise.getId());
        exerciseRepository.delete(exercise);
    }

    private void requireOwnerOrAdmin(Exercise exercise, UUID requesterId, boolean admin) {
        if (admin) {
            return;
        }
        if (exercise.getCreatedBy() == null || !exercise.getCreatedBy().equals(requesterId)) {
            throw new NotCatalogManagerException(
                    "Seul le createur de l'exercice ou un administrateur peut le modifier.");
        }
    }

    private void applyFields(Exercise exercise, ExerciseRequest request) {
        exercise.setName(request.name());
        exercise.setDescription(request.description());
        exercise.setEquipment(request.equipment());
        exercise.setDifficulty(request.difficulty());
        exercise.setDefaultRestSeconds(request.defaultRestSeconds());
        exercise.setMediaUrl(request.mediaUrl());
    }

    private void replaceAssociations(UUID exerciseId, ExerciseRequest request) {
        exerciseMuscleRepository.deleteByExerciseId(exerciseId);
        if (request.muscles() != null) {
            List<UUID> muscleGroupIds = request.muscles().stream().map(ExerciseMuscleInput::muscleGroupId).toList();
            if (muscleGroupRepository.findAllByIdIn(muscleGroupIds).size() != muscleGroupIds.size()) {
                throw new InvalidExerciseReferenceException("Un groupe musculaire reference n'existe pas.");
            }
            for (ExerciseMuscleInput muscle : request.muscles()) {
                exerciseMuscleRepository.save(new ExerciseMuscle(exerciseId, muscle.muscleGroupId(), muscle.role()));
            }
        }

        exerciseTagRepository.deleteByExerciseId(exerciseId);
        if (request.tagIds() != null) {
            if (tagRepository.findAllByIdIn(request.tagIds()).size() != request.tagIds().size()) {
                throw new InvalidExerciseReferenceException("Un tag reference n'existe pas.");
            }
            for (UUID tagId : request.tagIds()) {
                exerciseTagRepository.save(new ExerciseTag(exerciseId, tagId));
            }
        }

        exerciseAlternativeRepository.deleteByExerciseId(exerciseId);
        if (request.alternativeExerciseIds() != null) {
            for (UUID alternativeId : request.alternativeExerciseIds()) {
                if (alternativeId.equals(exerciseId)) {
                    throw new InvalidExerciseReferenceException("Un exercice ne peut pas etre sa propre alternative.");
                }
                if (!exerciseRepository.existsById(alternativeId)) {
                    throw new InvalidExerciseReferenceException("Un exercice alternatif reference n'existe pas.");
                }
                exerciseAlternativeRepository.save(new ExerciseAlternative(exerciseId, alternativeId));
            }
        }
    }

    private Exercise findOrThrow(UUID exerciseId) {
        return exerciseRepository.findById(exerciseId).orElseThrow(ExerciseNotFoundException::new);
    }

    private ExerciseResponse toResponse(Exercise exercise) {
        return toResponseList(List.of(exercise)).get(0);
    }

    /** Batch-loads reference data and associations for the whole list in O(1) queries instead of O(n). */
    private List<ExerciseResponse> toResponseList(List<Exercise> exercises) {
        if (exercises.isEmpty()) {
            return List.of();
        }
        Map<UUID, MuscleGroup> muscleGroupsById =
                muscleGroupRepository.findAll().stream().collect(Collectors.toMap(MuscleGroup::getId, m -> m));
        Map<UUID, Tag> tagsById = tagRepository.findAll().stream().collect(Collectors.toMap(Tag::getId, t -> t));

        List<UUID> exerciseIds = exercises.stream().map(Exercise::getId).toList();

        Map<UUID, List<ExerciseMuscle>> musclesByExercise = exerciseMuscleRepository
                .findByExerciseIdIn(exerciseIds)
                .stream()
                .collect(Collectors.groupingBy(ExerciseMuscle::getExerciseId));
        Map<UUID, List<ExerciseTag>> tagsByExercise = exerciseTagRepository
                .findByExerciseIdIn(exerciseIds)
                .stream()
                .collect(Collectors.groupingBy(ExerciseTag::getExerciseId));
        Map<UUID, List<ExerciseAlternative>> alternativesByExercise = exerciseAlternativeRepository
                .findByExerciseIdIn(exerciseIds)
                .stream()
                .collect(Collectors.groupingBy(ExerciseAlternative::getExerciseId));

        return exercises.stream()
                .map(exercise -> {
                    List<ExerciseMuscleResponse> muscles = musclesByExercise
                            .getOrDefault(exercise.getId(), List.of())
                            .stream()
                            .map(em -> {
                                MuscleGroup group = muscleGroupsById.get(em.getMuscleGroupId());
                                return new ExerciseMuscleResponse(
                                        em.getMuscleGroupId(), group.getCode(), group.getName(), em.getRole());
                            })
                            .toList();

                    List<TagResponse> tags = tagsByExercise
                            .getOrDefault(exercise.getId(), List.of())
                            .stream()
                            .map(et -> TagResponse.from(tagsById.get(et.getTagId())))
                            .toList();

                    List<UUID> alternativeIds = alternativesByExercise
                            .getOrDefault(exercise.getId(), List.of())
                            .stream()
                            .map(ExerciseAlternative::getAlternativeExerciseId)
                            .toList();

                    return ExerciseResponse.from(exercise, muscles, tags, alternativeIds);
                })
                .toList();
    }

    private String generateUniqueSlug(String name) {
        String base = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (base.isBlank()) {
            base = "exercice";
        }
        String slug = base;
        int suffix = 2;
        while (exerciseRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }
}
