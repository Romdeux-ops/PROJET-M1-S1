package com.fitcoach.program.service;

import com.fitcoach.catalog.api.ExerciseCatalog;
import com.fitcoach.coaching.api.CoachRelations;
import com.fitcoach.common.domain.Positions;
import com.fitcoach.identity.api.UserDirectory;
import com.fitcoach.identity.api.UserSummary;
import com.fitcoach.program.domain.Program;
import com.fitcoach.program.domain.ProgramCategory;
import com.fitcoach.program.domain.ProgramDay;
import com.fitcoach.program.domain.ProgramExercise;
import com.fitcoach.program.domain.ProgramLevel;
import com.fitcoach.program.domain.ProgramRating;
import com.fitcoach.program.domain.ProgramVisibility;
import com.fitcoach.program.dto.ProgramDayRequest;
import com.fitcoach.program.dto.ProgramDayResponse;
import com.fitcoach.program.dto.ProgramExerciseRequest;
import com.fitcoach.program.dto.ProgramExerciseResponse;
import com.fitcoach.program.dto.ProgramRequest;
import com.fitcoach.program.dto.ProgramResponse;
import com.fitcoach.program.dto.RatingRequest;
import com.fitcoach.program.dto.ReorderRequest;
import com.fitcoach.program.exception.CannotRateOwnProgramException;
import com.fitcoach.program.exception.NotProgramOwnerException;
import com.fitcoach.program.exception.ProgramDayNotFoundException;
import com.fitcoach.program.exception.ProgramExerciseNotFoundException;
import com.fitcoach.program.exception.ProgramNotFoundException;
import com.fitcoach.program.exception.ProgramNotPublicException;
import com.fitcoach.program.repository.ProgramDayRepository;
import com.fitcoach.program.repository.ProgramExerciseRepository;
import com.fitcoach.program.repository.ProgramRatingRepository;
import com.fitcoach.program.repository.ProgramRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgramService {

    private final ProgramRepository programRepository;
    private final ProgramDayRepository programDayRepository;
    private final ProgramExerciseRepository programExerciseRepository;
    private final ProgramRatingRepository programRatingRepository;
    private final ExerciseCatalog exerciseCatalog;
    private final UserDirectory userDirectory;
    private final CoachRelations coachRelations;

    public ProgramService(
            ProgramRepository programRepository,
            ProgramDayRepository programDayRepository,
            ProgramExerciseRepository programExerciseRepository,
            ProgramRatingRepository programRatingRepository,
            ExerciseCatalog exerciseCatalog,
            UserDirectory userDirectory,
            CoachRelations coachRelations) {
        this.programRepository = programRepository;
        this.programDayRepository = programDayRepository;
        this.programExerciseRepository = programExerciseRepository;
        this.programRatingRepository = programRatingRepository;
        this.exerciseCatalog = exerciseCatalog;
        this.userDirectory = userDirectory;
        this.coachRelations = coachRelations;
    }

    public Page<ProgramResponse> search(
            UUID viewerId, boolean mineOnly, ProgramCategory category, ProgramLevel level, Pageable pageable) {
        Page<Program> page = programRepository.search(viewerId, mineOnly, category, level, pageable);
        List<ProgramResponse> content = toResponseList(page.getContent(), viewerId);
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    /** Programmes CLIENTS des coachs ayant une relation ACTIVE avec {@code athleteId} (relue a chaque appel). */
    public Page<ProgramResponse> searchFromMyCoaches(
            UUID athleteId, ProgramCategory category, ProgramLevel level, Pageable pageable) {
        List<UUID> coachIds = coachRelations.activeCoachIds(athleteId);
        if (coachIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        Page<Program> page = programRepository.searchSharedByOwners(coachIds, category, level, pageable);
        return new PageImpl<>(toResponseList(page.getContent(), athleteId), pageable, page.getTotalElements());
    }

    public ProgramResponse get(UUID programId, UUID viewerId) {
        Program program = findVisibleOrThrow(programId, viewerId);
        return toResponse(program, viewerId);
    }

    public ProgramResponse getByShareToken(String shareToken, UUID viewerId) {
        Program program = programRepository.findByShareToken(shareToken).orElseThrow(ProgramNotFoundException::new);
        return toResponse(program, viewerId);
    }

    @Transactional
    public ProgramResponse create(UUID ownerId, ProgramRequest request) {
        Program program = new Program(ownerId, request.title(), request.category(), UUID.randomUUID().toString());
        applyFields(program, request);
        program = programRepository.save(program);
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse update(UUID programId, UUID ownerId, ProgramRequest request) {
        Program program = findOwnedOrThrow(programId, ownerId);
        applyFields(program, request);
        return toResponse(program, ownerId);
    }

    @Transactional
    public void delete(UUID programId, UUID ownerId) {
        Program program = findOwnedOrThrow(programId, ownerId);
        programRepository.delete(program);
    }

    @Transactional
    public ProgramResponse duplicate(UUID programId, UUID viewerId) {
        Program source = findVisibleOrThrow(programId, viewerId);
        Program copy = new Program(
                viewerId, source.getTitle() + " (copie)", source.getCategory(), UUID.randomUUID().toString());
        copy.setDescription(source.getDescription());
        copy.setLevel(source.getLevel());
        copy.setVisibility(ProgramVisibility.PRIVATE);
        copy = programRepository.save(copy);

        for (ProgramDay day : programDayRepository.findByProgramIdOrderByPosition(source.getId())) {
            ProgramDay dayCopy = programDayRepository.save(
                    new ProgramDay(copy.getId(), day.getPosition(), day.getName(), day.isRestDay()));
            for (ProgramExercise exercise : programExerciseRepository.findByProgramDayIdOrderByPosition(day.getId())) {
                ProgramExercise exerciseCopy = new ProgramExercise(
                        dayCopy.getId(), exercise.getExerciseId(), exercise.getPosition(), exercise.getSets(), exercise.getReps());
                exerciseCopy.setRestSeconds(exercise.getRestSeconds());
                exerciseCopy.setNotes(exercise.getNotes());
                programExerciseRepository.save(exerciseCopy);
            }
        }

        return toResponse(copy, viewerId);
    }

    @Transactional
    public ProgramResponse addDay(UUID programId, UUID ownerId, ProgramDayRequest request) {
        Program program = findOwnedOrThrow(programId, ownerId);
        int position = programDayRepository.findMaxPositionByProgramId(program.getId()).orElse(-1) + 1;
        programDayRepository.save(new ProgramDay(program.getId(), position, request.name(), request.restDay()));
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse deleteDay(UUID programId, UUID dayId, UUID ownerId) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        programDayRepository.delete(day);
        Positions.compact(programDayRepository.findByProgramIdOrderByPosition(program.getId()));
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse reorderDays(UUID programId, UUID ownerId, ReorderRequest request) {
        Program program = findOwnedOrThrow(programId, ownerId);
        Positions.applyOrder(programDayRepository.findByProgramIdOrderByPosition(program.getId()), request.orderedIds());
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse addExercise(UUID programId, UUID dayId, UUID ownerId, ProgramExerciseRequest request) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        if (!exerciseCatalog.exists(request.exerciseId())) {
            throw new ProgramExerciseNotFoundException();
        }
        int position = programExerciseRepository.findMaxPositionByProgramDayId(day.getId()).orElse(-1) + 1;
        ProgramExercise exercise = new ProgramExercise(
                day.getId(), request.exerciseId(), position, request.sets(), request.reps());
        exercise.setRestSeconds(request.restSeconds());
        exercise.setNotes(request.notes());
        programExerciseRepository.save(exercise);
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse deleteExercise(UUID programId, UUID dayId, UUID exerciseEntryId, UUID ownerId) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        ProgramExercise exercise = programExerciseRepository
                .findById(exerciseEntryId)
                .filter(e -> e.getProgramDayId().equals(day.getId()))
                .orElseThrow(ProgramExerciseNotFoundException::new);
        programExerciseRepository.delete(exercise);
        Positions.compact(programExerciseRepository.findByProgramDayIdOrderByPosition(day.getId()));
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse reorderExercises(UUID programId, UUID dayId, UUID ownerId, ReorderRequest request) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        Positions.applyOrder(programExerciseRepository.findByProgramDayIdOrderByPosition(day.getId()), request.orderedIds());
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse rate(UUID programId, UUID userId, RatingRequest request) {
        Program program = programRepository.findById(programId).orElseThrow(ProgramNotFoundException::new);
        if (program.getVisibility() != ProgramVisibility.PUBLIC) {
            throw new ProgramNotPublicException();
        }
        if (program.isOwnedBy(userId)) {
            throw new CannotRateOwnProgramException();
        }
        ProgramRating rating = programRatingRepository
                .findByProgramIdAndUserId(programId, userId)
                .orElseGet(() -> new ProgramRating(programId, userId, request.stars(), request.comment()));
        rating.setStars(request.stars());
        rating.setComment(request.comment());
        programRatingRepository.save(rating);
        return toResponse(program, userId);
    }

    private void applyFields(Program program, ProgramRequest request) {
        program.setTitle(request.title());
        program.setDescription(request.description());
        program.setCategory(request.category());
        program.setLevel(request.level());
        program.setVisibility(request.visibility());
    }

    private Program findOwnedOrThrow(UUID programId, UUID ownerId) {
        Program program = programRepository.findById(programId).orElseThrow(ProgramNotFoundException::new);
        if (!program.isOwnedBy(ownerId)) {
            throw new NotProgramOwnerException();
        }
        return program;
    }

    private Program findVisibleOrThrow(UUID programId, UUID viewerId) {
        Program program = programRepository.findById(programId).orElseThrow(ProgramNotFoundException::new);
        if (!canView(program, viewerId)) {
            throw new ProgramNotFoundException();
        }
        return program;
    }

    private boolean canView(Program program, UUID viewerId) {
        if (program.isOwnedBy(viewerId) || program.getVisibility() == ProgramVisibility.PUBLIC) {
            return true;
        }
        return program.getVisibility() == ProgramVisibility.CLIENTS
                && coachRelations.isActiveClient(program.getOwnerId(), viewerId);
    }

    private ProgramDay findDayOrThrow(UUID dayId, UUID programId) {
        return programDayRepository
                .findById(dayId)
                .filter(d -> d.getProgramId().equals(programId))
                .orElseThrow(ProgramDayNotFoundException::new);
    }

    private ProgramResponse toResponse(Program program, UUID viewerId) {
        return toResponseList(List.of(program), viewerId).get(0);
    }

    /** Batch-loads days/exercises/owners/ratings for the whole list in O(1) queries instead of O(n). */
    private List<ProgramResponse> toResponseList(List<Program> programs, UUID viewerId) {
        if (programs.isEmpty()) {
            return List.of();
        }
        List<UUID> programIds = programs.stream().map(Program::getId).toList();

        Map<UUID, UserSummary> owners = userDirectory.findAllById(
                programs.stream().map(Program::getOwnerId).distinct().toList());

        Map<UUID, ProgramRatingRepository.ProgramRatingAggregate> ratingAggregates = programRatingRepository
                .aggregateByProgramIdIn(programIds)
                .stream()
                .collect(Collectors.toMap(ProgramRatingRepository.ProgramRatingAggregate::getProgramId, a -> a));

        List<ProgramDay> allDays = programDayRepository.findByProgramIdInOrderByPosition(programIds);
        Map<UUID, List<ProgramDay>> daysByProgram = allDays.stream().collect(Collectors.groupingBy(ProgramDay::getProgramId));

        List<UUID> dayIds = allDays.stream().map(ProgramDay::getId).toList();
        List<ProgramExercise> allExercises = dayIds.isEmpty()
                ? List.of()
                : programExerciseRepository.findByProgramDayIdInOrderByPosition(dayIds);
        Map<UUID, List<ProgramExercise>> exercisesByDay =
                allExercises.stream().collect(Collectors.groupingBy(ProgramExercise::getProgramDayId));

        Map<UUID, String> exerciseNames = exerciseCatalog.namesOf(
                allExercises.stream().map(ProgramExercise::getExerciseId).distinct().toList());

        List<ProgramResponse> result = new ArrayList<>(programs.size());
        for (Program program : programs) {
            UserSummary owner = owners.get(program.getOwnerId());
            String ownerName = owner == null ? "" : owner.displayName();

            ProgramRatingRepository.ProgramRatingAggregate aggregate = ratingAggregates.get(program.getId());
            double average = aggregate == null || aggregate.getAverage() == null ? 0.0 : aggregate.getAverage();
            int ratingCount = aggregate == null ? 0 : aggregate.getTotal().intValue();

            List<ProgramDayResponse> days = daysByProgram
                    .getOrDefault(program.getId(), List.of())
                    .stream()
                    .map(day -> {
                        List<ProgramExerciseResponse> exercises = exercisesByDay
                                .getOrDefault(day.getId(), List.of())
                                .stream()
                                .map(e -> ProgramExerciseResponse.from(
                                        e, exerciseNames.getOrDefault(e.getExerciseId(), "")))
                                .toList();
                        return ProgramDayResponse.from(day, exercises);
                    })
                    .toList();

            result.add(ProgramResponse.from(program, ownerName, average, ratingCount, program.isOwnedBy(viewerId), days));
        }
        return result;
    }
}
