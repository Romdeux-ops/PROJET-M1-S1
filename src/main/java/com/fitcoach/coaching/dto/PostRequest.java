package com.fitcoach.coaching.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** {@code POST /api/coaching/posts}. */
public record PostRequest(@NotBlank @Size(max = 5000) String content, String imageUrl) {}
