package com.fitcoach.catalog.dto;

import com.fitcoach.catalog.domain.Tag;
import java.util.UUID;

public record TagResponse(UUID id, String code, String name) {
    public static TagResponse from(Tag tag) {
        return new TagResponse(tag.getId(), tag.getCode(), tag.getName());
    }
}
