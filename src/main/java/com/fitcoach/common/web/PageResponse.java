package com.fitcoach.common.web;

import java.util.List;
import org.springframework.data.domain.Page;

/** Lightweight pagination envelope shared by every paginated list endpoint. */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
