package com.fitcoach.ai.exception;

import com.fitcoach.common.exception.ServiceUnavailableException;

public class AiNotConfiguredException extends ServiceUnavailableException {
    public AiNotConfiguredException() {
        super("Generation IA non configuree : la cle ANTHROPIC_API_KEY est absente du serveur.");
    }
}
