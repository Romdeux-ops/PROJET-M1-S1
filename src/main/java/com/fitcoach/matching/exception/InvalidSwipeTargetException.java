package com.fitcoach.matching.exception;

import com.fitcoach.common.exception.BusinessRuleException;

public class InvalidSwipeTargetException extends BusinessRuleException {
    public InvalidSwipeTargetException() {
        super("Un athlete ne peut swiper qu'un coach, et un coach qu'un athlete.");
    }
}
