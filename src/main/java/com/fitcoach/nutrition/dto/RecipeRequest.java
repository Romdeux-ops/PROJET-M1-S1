package com.fitcoach.nutrition.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record RecipeRequest(

        @NotBlank
        @Size(max = 200)
        String name,

        @Size(max = 2000)
        String description,

        @Positive
        int servings,

        @Positive
        Integer preparationMinutes,

        @Size(max = 10000)
        String instructions,

        @NotNull
        @Size(min = 1)
        List<@Valid RecipeItemRequest> items

) {}