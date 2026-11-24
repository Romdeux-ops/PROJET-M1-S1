
package com.fitcoach.nutrition.service;

import com.fitcoach.nutrition.domain.Food;
import com.fitcoach.nutrition.dto.FoodResponse;
import com.fitcoach.nutrition.exception.FoodNotFoundException;
import com.fitcoach.nutrition.repository.FoodRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FoodService {

    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    public List<FoodResponse> getAllFoods() {
        return foodRepository.findAllByOrderByNameAsc()
                .stream()
                .map(FoodResponse::from)
                .toList();
    }

    public List<FoodResponse> searchFoods(String name) {
        if (name == null || name.isBlank()) {
            return getAllFoods();
        }

        return foodRepository.findByNameContainingIgnoreCaseOrderByNameAsc(name.trim())
                .stream()
                .map(FoodResponse::from)
                .toList();
    }

    public List<FoodResponse> getFoodsByCategory(String category) {
        if (category == null || category.isBlank()) {
            return getAllFoods();
        }

        return foodRepository.findByCategoryIgnoreCaseOrderByNameAsc(category.trim())
                .stream()
                .map(FoodResponse::from)
                .toList();
    }

    public FoodResponse getFoodById(UUID id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(FoodNotFoundException::new);

        return FoodResponse.from(food);
    }
}
