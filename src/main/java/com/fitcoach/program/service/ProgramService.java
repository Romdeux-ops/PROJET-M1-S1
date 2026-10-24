package com.fitcoach.program.service;

import com.fitcoach.catalog.repository.ExerciseRepository;
import com.fitcoach.identity.domain.User;
import com.fitcoach.identity.repository.UserRepository;
import com.fitcoach.program.domain.Program;
import com.fitcoach.program.domain.ProgramCategory;
import com.fitcoach.program.domain.ProgramDay;
import com.fitcoach.program.domain.ProgramExercise;
import com.fitcoach.program.domain.ProgramLevel;
import com.fitcoach.program.domain.ProgramRating;
import com.fitcoach.program.domain.ProgramVisibility;
import com.fitcoach.program.dto.PositionUpdate;
import com.fitcoach.program.dto.ProgramDayRequest;
import com.fitcoach.program.dto.ProgramDayResponse;
import com.fitcoach.program.dto.ProgramExerciseRequest;
import com.fitcoach.program.dto.ProgramExerciseResponse;
import com.fitcoach.program.dto.ProgramRequest;
import com.fitcoach.program.dto.ProgramResponse;
import com.fitcoach.program.dto.RatingRequest;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgramService {

    private final ProgramRepository programRepository;
    private final ProgramDayRepository programDayRepository;
    private final ProgramExerciseRepository programExerciseRepository;
    private final ProgramRatingRepository programRatingRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ProgramService(
            ProgramRepository programRepository,
            ProgramDayRepository programDayRepository,
            ProgramExerciseRepository programExerciseRepository,
            ProgramRatingRepository programRatingRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository) {
        this.programRepository = programRepository;
        this.programDayRepository = programDayRepository;
        this.programExerciseRepository = programExerciseRepository;
        this.programRatingRepository = programRatingRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    public List<ProgramResponse> search(UUID viewerId, boolean mineOnly, ProgramCategory category, ProgramLevel level) {
        return programRepository.search(viewerId, mineOnly, category, level).stream()
                .map(p -> toResponse(p, viewerId))
                .toList();
    }

    public ProgramResponse get(UUID programId, UUID viewerId) {
        Program program = findVisibleOrThrow(programId, viewerId);
        return toResponse(program, viewerId);
    }

    public ProgramResponse getByShareToken(String shareToken) {
        Program program = programRepository.findByShareToken(shareToken).orElseThrow(ProgramNotFoundException::new);
        return toResponse(program, program.getOwnerId());
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
        int position = programDayRepository.countByProgramId(program.getId());
        programDayRepository.save(new ProgramDay(program.getId(), position, request.name(), request.restDay()));
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse deleteDay(UUID programId, UUID dayId, UUID ownerId) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        programDayRepository.delete(day);
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse reorderDays(UUID programId, UUID ownerId, List<PositionUpdate> updates) {
        Program program = findOwnedOrThrow(programId, ownerId);
        for (PositionUpdate update : updates) {
            ProgramDay day = findDayOrThrow(update.id(), program.getId());
            day.setPosition(update.position());
        }
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse addExercise(UUID programId, UUID dayId, UUID ownerId, ProgramExerciseRequest request) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        if (!exerciseRepository.existsById(request.exerciseId())) {
            throw new ProgramExerciseNotFoundException();
        }
        int position = programExerciseRepository.countByProgramDayId(day.getId());
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
        return toResponse(program, ownerId);
    }

    @Transactional
    public ProgramResponse reorderExercises(UUID programId, UUID dayId, UUID ownerId, List<PositionUpdate> updates) {
        Program program = findOwnedOrThrow(programId, ownerId);
        ProgramDay day = findDayOrThrow(dayId, program.getId());
        for (PositionUpdate update : updates) {
            ProgramExercise exercise = programExerciseRepository
                    .findById(update.id())
                    .filter(e -> e.getProgramDayId().equals(day.getId()))
                    .orElseThrow(ProgramExerciseNotFoundException::new);
            exercise.setPosition(update.position());
        }
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
        if (!program.isVisibleTo(viewerId)) {
            throw new ProgramNotFoundException();
        }
        return program;
    }

    private ProgramDay findDayOrThrow(UUID dayId, UUID programId) {
        return programDayRepository
                .findById(dayId)
                .filter(d -> d.getProgramId().equals(programId))
                .orElseThrow(ProgramDayNotFoundException::new);
    }

    private ProgramResponse toResponse(Program program, UUID viewerId) {
        User owner = userRepository.findById(program.getOwnerId()).orElse(null);
        String ownerName = owner == null ? "" : owner.getFirstName() + " " + owner.getLastName();

        List<ProgramRating> ratings = programRatingRepository.findByProgramId(program.getId());
        double average = ratings.isEmpty()
                ? 0.0
                : ratings.stream().mapToInt(ProgramRating::getStars).average().orElse(0.0);

        Map<UUID, String> exerciseNames = exerciseRepository.findAllById(
                        programDayRepository.findByProgramIdOrderByPosition(program.getId()).stream()
                                .flatMap(d -> programExerciseRepository.findByProgramDayIdOrderByPosition(d.getId()).stream())
                                .map(ProgramExercise::getExerciseId)
                                .distinct()
                                .toList())
                .stream()
                .collect(Collectors.toMap(e -> e.getId(), e -> e.getName()));

        List<ProgramDayResponse> days = programDayRepository.findByProgramIdOrderByPosition(program.getId()).stream()
                .map(day -> {
                    List<ProgramExerciseResponse> exercises =
                            programExerciseRepository.findByProgramDayIdOrderByPosition(day.getId()).stream()
                                    .map(e -> ProgramExerciseResponse.from(
                                            e, exerciseNames.getOrDefault(e.getExerciseId(), "")))
                                    .toList();
                    return ProgramDayResponse.from(day, exercises);
                })
                .toList();

        return ProgramResponse.from(program, ownerName, average, ratings.size(), program.isOwnedBy(viewerId), days);
    }
}
