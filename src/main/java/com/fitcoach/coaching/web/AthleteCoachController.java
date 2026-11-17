package com.fitcoach.coaching.web;

import com.fitcoach.coaching.service.CoachingService;
import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.identity.api.UserSummary;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cote athlete : la liste de ses propres coachs (symetrique a {@link CoachAthleteController}). */
@RestController
@RequestMapping("/api/coaching/coaches")
public class AthleteCoachController {

    private final CoachingService coachingService;

    public AthleteCoachController(CoachingService coachingService) {
        this.coachingService = coachingService;
    }

    /** Coachs dont la relation est active. */
    @GetMapping
    public List<UserSummary> list(Authentication authentication) {
        return coachingService.listCoaches(AuthenticatedUsers.id(authentication));
    }

    /** L'athlete met fin a la relation avec un de ses coachs. */
    @DeleteMapping("/{coachId}")
    public ResponseEntity<Void> end(Authentication authentication, @PathVariable UUID coachId) {
        coachingService.endRelation(coachId, AuthenticatedUsers.id(authentication));
        return ResponseEntity.noContent().build();
    }
}
