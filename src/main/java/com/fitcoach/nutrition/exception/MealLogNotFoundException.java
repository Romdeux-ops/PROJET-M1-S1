
package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.NotFoundException;

public class MealLogNotFoundException extends NotFoundException {

    public MealLogNotFoundException() {
        super("Meal log not found");
    }
}
