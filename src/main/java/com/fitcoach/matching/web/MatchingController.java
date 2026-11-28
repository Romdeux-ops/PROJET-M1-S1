package com.fitcoach.matching.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.matching.dto.CandidateResponse;
import com.fitcoach.matching.dto.MatchProfileRequest;
import com.fitcoach.matching.dto.MatchResponse;
import com.fitcoach.matching.dto.MyMatchProfileResponse;
import com.fitcoach.matching.dto.SwipeRequest;
import com.fitcoach.matching.dto.SwipeResponse;
import com.fitcoach.matching.service.MatchingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    /** Toujours 200 : {@code profile} est nul tant que l'utilisateur ne s'est pas inscrit. */
    @GetMapping("/profile")
    public MyMatchProfileResponse profile(Authentication authentication) {
        return matchingService.getProfile(AuthenticatedUsers.id(authentication));
    }

    @PutMapping("/profile")
    public MyMatchProfileResponse saveProfile(
            Authentication authentication, @Valid @RequestBody MatchProfileRequest request) {
        return matchingService.saveProfile(AuthenticatedUsers.id(authentication), request);
    }

    @GetMapping("/feed")
    public List<CandidateResponse> feed(Authentication authentication, @RequestParam(required = false) Integer limit) {
        return matchingService.feed(AuthenticatedUsers.id(authentication), limit);
    }

    @PostMapping("/swipes")
    public SwipeResponse swipe(Authentication authentication, @Valid @RequestBody SwipeRequest request) {
        return matchingService.swipe(AuthenticatedUsers.id(authentication), request);
    }

    @GetMapping("/matches")
    public List<MatchResponse> matches(Authentication authentication) {
        return matchingService.listMatches(AuthenticatedUsers.id(authentication));
    }

    @DeleteMapping("/matches/{matchId}")
    public ResponseEntity<Void> unmatch(Authentication authentication, @PathVariable UUID matchId) {
        matchingService.unmatch(AuthenticatedUsers.id(authentication), matchId);
        return ResponseEntity.noContent().build();
    }
}
