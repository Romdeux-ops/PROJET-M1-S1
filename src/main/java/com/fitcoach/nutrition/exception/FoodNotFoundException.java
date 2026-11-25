
package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.NotFoundException;

public class FoodNotFoundException extends NotFoundException {

    public FoodNotFoundException() {
        super("Food not found");
    }
}
