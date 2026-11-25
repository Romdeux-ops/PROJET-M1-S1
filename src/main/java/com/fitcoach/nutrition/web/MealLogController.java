
package com.fitcoach.nutrition.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.nutrition.dto.MealLogItemRequest;
import com.fitcoach.nutrition.dto.MealLogRequest;
import com.fitcoach.nutrition.dto.MealLogResponse;
import com.fitcoach.nutrition.dto.UpdateMealLogItemRequest;
import com.fitcoach.nutrition.service.MealLogService;
import jakarta.validation.Valid;
import java.time.Instant;
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
@RequestMapping("/api/nutrition/meals")
public class MealLogController {

    private final MealLogService mealLogService;

    public MealLogController(MealLogService mealLogService) {
        this.mealLogService = mealLogService;
    }

    @GetMapping
    public List<MealLogResponse> getMealLogs(
            Authentication authentication,
            @RequestParam Instant start,
            @RequestParam Instant end
    ) {
        return mealLogService.getMealLogs(
                AuthenticatedUsers.id(authentication),
                start,
                end
        );
    }

    @GetMapping("/{mealLogId}")
    public MealLogResponse getMealLog(
            Authentication authentication,
            @PathVariable UUID mealLogId
    ) {
        return mealLogService.getMealLog(
                AuthenticatedUsers.id(authentication),
                mealLogId
        );
    }

    @PostMapping
    public ResponseEntity<MealLogResponse> createMealLog(
            Authentication authentication,
            @Valid @RequestBody MealLogRequest request
    ) {
        MealLogResponse mealLog = mealLogService.createMealLog(
                AuthenticatedUsers.id(authentication),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(mealLog);
    }

    @PostMapping("/{mealLogId}/items")
    public MealLogResponse addFoodToMeal(
            Authentication authentication,
            @PathVariable UUID mealLogId,
            @Valid @RequestBody MealLogItemRequest request
    ) {
        return mealLogService.addFoodToMeal(
                AuthenticatedUsers.id(authentication),
                mealLogId,
                request
        );
    }

    // Modification de la quantité d'un aliment

    @PutMapping("/{mealLogId}/items/{itemId}")
    public MealLogResponse updateMealItem(
            Authentication authentication,
            @PathVariable UUID mealLogId,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateMealLogItemRequest request
    ) {
        return mealLogService.updateMealItem(
                AuthenticatedUsers.id(authentication),
                mealLogId,
                itemId,
                request
        );
    }

    // Suppression individuelle d'un aliment

    @DeleteMapping("/{mealLogId}/items/{itemId}")
    public MealLogResponse deleteMealItem(
            Authentication authentication,
            @PathVariable UUID mealLogId,
            @PathVariable UUID itemId
    ) {
        return mealLogService.deleteMealItem(
                AuthenticatedUsers.id(authentication),
                mealLogId,
                itemId
        );
    }

    @DeleteMapping("/{mealLogId}")
    public ResponseEntity<Void> deleteMealLog(
            Authentication authentication,
            @PathVariable UUID mealLogId
    ) {
        mealLogService.deleteMealLog(
                AuthenticatedUsers.id(authentication),
                mealLogId
        );

        return ResponseEntity.noContent().build();
    }
}
