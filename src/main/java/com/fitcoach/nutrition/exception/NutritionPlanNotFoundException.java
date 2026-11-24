
package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.NotFoundException;

public class NutritionPlanNotFoundException extends NotFoundException {

    public NutritionPlanNotFoundException() {
        super("Nutrition plan not found");
    }
}
