package com.fitcoach.ai.exception;

import com.fitcoach.common.exception.ServiceUnavailableException;

/** Le modele n'a pas repondu, a refuse, ou sa reponse n'est pas exploitable. */
public class AiGenerationFailedException extends ServiceUnavailableException {
    public AiGenerationFailedException(String message) {
        super(message);
    }
}
