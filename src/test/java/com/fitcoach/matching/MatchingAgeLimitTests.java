package com.fitcoach.matching;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.FixedClockConfig;
import com.fitcoach.support.TestUsers.Registered;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Limite d'age de FitMatch au jour pres, avec l'horloge figee de
 * {@link FixedClockConfig} : le 13 janvier 2025 a 00h30 a Paris, encore le 12 en
 * UTC. Un calcul qui oublierait le fuseau metier se tromperait d'un jour.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(FixedClockConfig.class)
class MatchingAgeLimitTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient api;

    @BeforeEach
    void setUp() {
        api = new ApiClient(mockMvc);
    }

    private static Map<String, Object> profileBornOn(String birthDate) {
        return Map.of(
                "headline", "Premiere seance",
                "sports", List.of("RUNNING"),
                "availability", List.of("MORNING"),
                "trainingMode", "REMOTE",
                "birthDate", birthDate);
    }

    @Test
    void sixteenTodayIsAccepted() throws Exception {
        Registered athlete = api.register("ATHLETE");

        api.put(athlete, "/api/matching/profile", profileBornOn("2009-01-13"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(16));
    }

    @Test
    void sixteenTomorrowIsRefused() throws Exception {
        Registered athlete = api.register("ATHLETE");

        api.put(athlete, "/api/matching/profile", profileBornOn("2009-01-14")).andExpect(status().isBadRequest());
    }
}
