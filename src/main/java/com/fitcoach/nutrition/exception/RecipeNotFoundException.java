
package com.fitcoach.nutrition.exception;

import com.fitcoach.common.exception.NotFoundException;

public class RecipeNotFoundException extends NotFoundException {

    public RecipeNotFoundException() {
        super("Recipe not found");
    }
}
