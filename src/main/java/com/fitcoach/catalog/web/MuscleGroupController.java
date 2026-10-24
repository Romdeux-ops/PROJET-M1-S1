package com.fitcoach.catalog.web;

import com.fitcoach.catalog.dto.MuscleGroupResponse;
import com.fitcoach.catalog.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/muscle-groups")
public class MuscleGroupController {

    private final CatalogService catalogService;

    public MuscleGroupController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<MuscleGroupResponse> list() {
        return catalogService.listMuscleGroups();
    }
}
