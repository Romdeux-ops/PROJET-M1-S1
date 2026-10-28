package com.fitcoach.catalog.web;

import com.fitcoach.catalog.dto.TagResponse;
import com.fitcoach.catalog.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/tags")
public class TagController {

    private final CatalogService catalogService;

    public TagController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<TagResponse> list() {
        return catalogService.listTags();
    }
}
