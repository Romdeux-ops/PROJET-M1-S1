
package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.NotFoundException;

public class MealLogItemNotFoundException extends NotFoundException {

    public MealLogItemNotFoundException() {
        super("Aliment du repas introuvable.");
    }
}
