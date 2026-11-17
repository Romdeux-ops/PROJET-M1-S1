package com.fitcoach.ai.web;

import com.fitcoach.ai.dto.GeneratedProgramResponse;
import com.fitcoach.ai.dto.ProgramGenerationRequest;
import com.fitcoach.ai.service.ProgramGenerationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class ProgramGenerationController {

    private final ProgramGenerationService generationService;

    public ProgramGenerationController(ProgramGenerationService generationService) {
        this.generationService = generationService;
    }

    /** Authentifie (tout role). Renvoie un brouillon : rien n'est ecrit en base. */
    @PostMapping("/program-generation")
    public GeneratedProgramResponse generate(@Valid @RequestBody ProgramGenerationRequest request) {
        return generationService.generate(request);
    }
}
