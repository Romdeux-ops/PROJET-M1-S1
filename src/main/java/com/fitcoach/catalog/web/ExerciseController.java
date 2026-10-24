package com.fitcoach.catalog.web;

import com.fitcoach.catalog.domain.ExerciseDifficulty;
import com.fitcoach.catalog.dto.ExerciseRequest;
import com.fitcoach.catalog.dto.ExerciseResponse;
import com.fitcoach.catalog.exception.NotCatalogManagerException;
import com.fitcoach.catalog.service.CatalogService;
import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.identity.domain.RoleCode;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/catalog/exercises")
public class ExerciseController {

    private final CatalogService catalogService;

    public ExerciseController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<ExerciseResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID muscleGroupId,
            @RequestParam(required = false) UUID tagId,
            @RequestParam(required = false) ExerciseDifficulty difficulty) {
        return catalogService.search(query, muscleGroupId, tagId, difficulty);
    }

    @GetMapping("/{exerciseId}")
    public ExerciseResponse get(@PathVariable UUID exerciseId) {
        return catalogService.get(exerciseId);
    }

    @PostMapping
    public ResponseEntity<ExerciseResponse> create(Authentication authentication, @Valid @RequestBody ExerciseRequest request) {
        requireCatalogManager(authentication);
        ExerciseResponse exercise = catalogService.create(request, AuthenticatedUsers.id(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(exercise);
    }

    @PutMapping("/{exerciseId}")
    public ExerciseResponse update(
            Authentication authentication, @PathVariable UUID exerciseId, @Valid @RequestBody ExerciseRequest request) {
        requireCatalogManager(authentication);
        return catalogService.update(exerciseId, request);
    }

    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable UUID exerciseId) {
        requireCatalogManager(authentication);
        catalogService.delete(exerciseId);
        return ResponseEntity.noContent().build();
    }

    private void requireCatalogManager(Authentication authentication) {
        boolean allowed = AuthenticatedUsers.hasAuthority(authentication, RoleCode.COACH.name())
                || AuthenticatedUsers.hasAuthority(authentication, RoleCode.ADMIN.name());
        if (!allowed) {
            throw new NotCatalogManagerException();
        }
    }
}
