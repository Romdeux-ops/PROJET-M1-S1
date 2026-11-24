package com.fitcoach.nutrition.web;

import com.fitcoach.nutrition.dto.FoodResponse;
import com.fitcoach.nutrition.service.FoodService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nutrition/foods")
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @GetMapping
    public List<FoodResponse> getAllFoods() {
        return foodService.getAllFoods();
    }

    @GetMapping("/search")
    public List<FoodResponse> searchFoods(@RequestParam String name) {
        return foodService.searchFoods(name);
    }

    @GetMapping("/category")
    public List<FoodResponse> getFoodsByCategory(@RequestParam String name) {
        return foodService.getFoodsByCategory(name);
    }

    @GetMapping("/{foodId}")
    public FoodResponse getFoodById(@PathVariable UUID foodId) {
        return foodService.getFoodById(foodId);
    }
}