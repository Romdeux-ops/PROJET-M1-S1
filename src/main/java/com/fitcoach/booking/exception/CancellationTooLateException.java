package com.fitcoach.booking.exception;

import com.fitcoach.common.exception.BusinessRuleException;
import java.time.Duration;

public class CancellationTooLateException extends BusinessRuleException {
    public CancellationTooLateException(Duration notice) {
        super("Une reservation ne peut plus etre annulee moins de " + notice.toHours() + " h avant son debut.");
    }
}
