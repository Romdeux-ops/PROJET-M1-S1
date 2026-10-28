package com.fitcoach.program;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Le reordonnancement remplace l'ordre complet : positions 0..n-1, sans trou ni doublon. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProgramReorderTests {

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered owner;
    private String programId;
    private List<String> dayIds;

    @BeforeEach
    void createProgramWithThreeDays() throws Exception {
        client = new ApiClient(mockMvc);
        owner = client.register("COACH");
        Map<String, Object> program =
                Map.of("title", "Programme", "category", "STRENGTH", "level", "BEGINNER", "visibility", "PRIVATE");
        programId = client.json(client.post(owner, "/api/programs", program).andExpect(status().isCreated()))
                .get("id")
                .asText();
        JsonNode response = null;
        for (String name : List.of("A", "B", "C")) {
            response = client.json(client.post(
                            owner, "/api/programs/" + programId + "/days", Map.of("name", name, "restDay", false))
                    .andExpect(status().isOk()));
        }
        dayIds = idsInOrder(response);
    }

    @Test
    void reversingTheDaysSwapsPositionsInOneRequest() throws Exception {
        List<String> reversed = List.of(dayIds.get(2), dayIds.get(1), dayIds.get(0));

        JsonNode program = client.json(reorder(reversed).andExpect(status().isOk()));

        assertThat(idsInOrder(program)).isEqualTo(reversed);
        assertThat(positions(program)).containsExactly(0, 1, 2);
    }

    @Test
    void anIncompleteDuplicatedOrUnknownOrderIsRejected() throws Exception {
        reorder(List.of(dayIds.get(0), dayIds.get(1))).andExpect(status().isBadRequest());
        reorder(List.of(dayIds.get(0), dayIds.get(0), dayIds.get(1))).andExpect(status().isBadRequest());
        reorder(List.of(dayIds.get(0), dayIds.get(1), "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isBadRequest());
        reorder(List.of()).andExpect(status().isBadRequest());
    }

    @Test
    void deletingADayCompactsThePositions() throws Exception {
        JsonNode program = client.json(client.delete(owner, "/api/programs/" + programId + "/days/" + dayIds.get(1))
                .andExpect(status().isOk()));

        assertThat(idsInOrder(program)).containsExactly(dayIds.get(0), dayIds.get(2));
        assertThat(positions(program)).containsExactly(0, 1);
    }

    private ResultActions reorder(List<String> orderedIds) throws Exception {
        return client.patch(owner, "/api/programs/" + programId + "/days/positions", Map.of("orderedIds", orderedIds));
    }

    private static List<String> idsInOrder(JsonNode program) {
        List<String> ids = new ArrayList<>();
        program.get("days").forEach(day -> ids.add(day.get("id").asText()));
        return ids;
    }

    private static List<Integer> positions(JsonNode program) {
        List<Integer> positions = new ArrayList<>();
        program.get("days").forEach(day -> positions.add(day.get("position").asInt()));
        return positions;
    }
}
