package com.fitcoach.catalog.web;

import com.fitcoach.catalog.domain.ExerciseDifficulty;
import com.fitcoach.catalog.dto.ExerciseRequest;
import com.fitcoach.catalog.dto.ExerciseResponse;
import com.fitcoach.catalog.service.CatalogService;
import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.common.security.RoleCode;
import com.fitcoach.common.web.PageResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/catalog/exercises")
public class ExerciseController {

    private final CatalogService catalogService;

    public ExerciseController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public PageResponse<ExerciseResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID muscleGroupId,
            @RequestParam(required = false) UUID tagId,
            @RequestParam(required = false) ExerciseDifficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), boundedSize, Sort.by(Sort.Direction.ASC, "name"));
        return PageResponse.of(catalogService.search(query, muscleGroupId, tagId, difficulty, pageRequest));
    }

    @GetMapping("/{exerciseId}")
    public ExerciseResponse get(@PathVariable UUID exerciseId) {
        return catalogService.get(exerciseId);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('COACH','ADMIN')")
    public ResponseEntity<ExerciseResponse> create(Authentication authentication, @Valid @RequestBody ExerciseRequest request) {
        ExerciseResponse exercise = catalogService.create(request, AuthenticatedUsers.id(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(exercise);
    }

    @PutMapping("/{exerciseId}")
    @PreAuthorize("hasAnyAuthority('COACH','ADMIN')")
    public ExerciseResponse update(
            Authentication authentication, @PathVariable UUID exerciseId, @Valid @RequestBody ExerciseRequest request) {
        return catalogService.update(exerciseId, request, AuthenticatedUsers.id(authentication), isAdmin(authentication));
    }

    @DeleteMapping("/{exerciseId}")
    @PreAuthorize("hasAnyAuthority('COACH','ADMIN')")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID exerciseId) {
        catalogService.delete(exerciseId, AuthenticatedUsers.id(authentication), isAdmin(authentication));
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        return AuthenticatedUsers.hasAuthority(authentication, RoleCode.ADMIN.name());
    }
}
