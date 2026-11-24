package com.fitcoach.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** La validation porte sur le texte tel qu'il sera stocke, espaces de bord retires. */
public record SendMessageRequest(@NotBlank @Size(max = 2000) String body) {

    public SendMessageRequest {
        body = body == null ? null : body.strip();
    }
}
