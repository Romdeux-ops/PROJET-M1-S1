
package com.fitcoach.nutrition.repository;

import com.fitcoach.nutrition.domain.Food;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRepository extends JpaRepository<Food, UUID> {

    List<Food> findAllByOrderByNameAsc();

    List<Food> findByNameContainingIgnoreCaseOrderByNameAsc(String name);

    List<Food> findByCategoryIgnoreCaseOrderByNameAsc(String category);
}
