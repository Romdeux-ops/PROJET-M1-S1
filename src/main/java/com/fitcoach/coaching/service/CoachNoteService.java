package com.fitcoach.coaching.service;

import com.fitcoach.coaching.domain.CoachNote;
import com.fitcoach.coaching.dto.NoteRequest;
import com.fitcoach.coaching.dto.NoteResponse;
import com.fitcoach.coaching.exception.AthleteNotFoundException;
import com.fitcoach.coaching.exception.CoachNoteNotFoundException;
import com.fitcoach.coaching.repository.CoachNoteRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Notes privees d'un coach sur un athlete.
 *
 * <p>Toute requete est bornee par l'auteur : un coach ne voit jamais les notes
 * d'un autre coach, et l'athlete n'a aucune route vers elles. Creer ou modifier
 * exige une relation active ; lire et supprimer ses propres notes reste possible
 * une fois la relation terminee.
 */
@Service
@Transactional(readOnly = true)
public class CoachNoteService {

    private final CoachNoteRepository coachNoteRepository;
    private final CoachingService coachingService;

    public CoachNoteService(CoachNoteRepository coachNoteRepository, CoachingService coachingService) {
        this.coachNoteRepository = coachNoteRepository;
        this.coachingService = coachingService;
    }

    public Page<NoteResponse> list(UUID coachId, UUID athleteId, Pageable pageable) {
        return coachNoteRepository
                .findByCoachIdAndAthleteIdOrderByCreatedAtDesc(coachId, athleteId, pageable)
                .map(NoteResponse::from);
    }

    @Transactional
    public NoteResponse create(UUID coachId, UUID athleteId, NoteRequest request) {
        requireActiveClient(coachId, athleteId);
        return NoteResponse.from(coachNoteRepository.save(new CoachNote(coachId, athleteId, request.content())));
    }

    @Transactional
    public NoteResponse update(UUID coachId, UUID athleteId, UUID noteId, NoteRequest request) {
        requireActiveClient(coachId, athleteId);
        CoachNote note = findOwned(coachId, athleteId, noteId);
        note.edit(request.content());
        return NoteResponse.from(note);
    }

    @Transactional
    public void delete(UUID coachId, UUID athleteId, UUID noteId) {
        coachNoteRepository.delete(findOwned(coachId, athleteId, noteId));
    }

    private CoachNote findOwned(UUID coachId, UUID athleteId, UUID noteId) {
        return coachNoteRepository
                .findByIdAndCoachIdAndAthleteId(noteId, coachId, athleteId)
                .orElseThrow(CoachNoteNotFoundException::new);
    }

    private void requireActiveClient(UUID coachId, UUID athleteId) {
        if (!coachingService.isActiveClient(coachId, athleteId)) {
            throw new AthleteNotFoundException();
        }
    }
}
