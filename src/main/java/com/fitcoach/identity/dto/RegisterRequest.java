package com.fitcoach.identity.dto;

import com.fitcoach.common.security.RoleCode;
import com.fitcoach.identity.api.Emails;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** {@code POST /api/auth/register}. */
public record RegisterRequest(
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @NotBlank @Email String email,
        @NotBlank
                @Size(min = 8, message = "8 caracteres minimum")
                @Pattern(regexp = ".*[A-Z].*", message = "Au moins une majuscule")
                @Pattern(regexp = ".*\\d.*", message = "Au moins un chiffre")
                String password,
        @NotNull RoleCode role) {

    public RegisterRequest {
        email = Emails.normalize(email);
    }
}
