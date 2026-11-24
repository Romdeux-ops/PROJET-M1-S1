package com.fitcoach.nutrition.web;

import com.fitcoach.common.security.AuthenticatedUsers;
import com.fitcoach.nutrition.dto.NutritionPlanRequest;
import com.fitcoach.nutrition.dto.NutritionPlanResponse;
import com.fitcoach.nutrition.service.NutritionPlanService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nutrition/plans")
public class NutritionPlanController {

    private final NutritionPlanService nutritionPlanService;

    public NutritionPlanController(NutritionPlanService nutritionPlanService) {
        this.nutritionPlanService = nutritionPlanService;
    }

    @GetMapping
    public List<NutritionPlanResponse> getAllPlans(Authentication authentication) {
        return nutritionPlanService.getAllPlans(
                AuthenticatedUsers.id(authentication)
        );
    }

    @GetMapping("/current")
    public NutritionPlanResponse getCurrentPlan(Authentication authentication) {
        return nutritionPlanService.getCurrentPlan(
                AuthenticatedUsers.id(authentication)
        );
    }

    @GetMapping("/by-date")
    public NutritionPlanResponse getPlanForDate(
            Authentication authentication,
            @RequestParam LocalDate date
    ) {
        return nutritionPlanService.getPlanForDate(
                AuthenticatedUsers.id(authentication),
                date
        );
    }

    @PostMapping
    public ResponseEntity<NutritionPlanResponse> createPlan(
            Authentication authentication,
            @Valid @RequestBody NutritionPlanRequest request
    ) {
        NutritionPlanResponse plan = nutritionPlanService.createPlan(
                AuthenticatedUsers.id(authentication),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(plan);
    }
}