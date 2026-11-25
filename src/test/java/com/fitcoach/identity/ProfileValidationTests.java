package com.fitcoach.identity;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** PATCH du profil : noms non vides, taille alignee sur la contrainte de la base. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProfileValidationTests {

    private static final String PROFILE = "/api/users/me/profile";

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered user;

    @BeforeEach
    void setUp() throws Exception {
        client = new ApiClient(mockMvc);
        user = client.register("ATHLETE");
    }

    @Test
    void emptyOrBlankNamesAreRejected() throws Exception {
        client.patch(user, PROFILE, Map.of("firstName", "")).andExpect(status().isBadRequest());
        client.patch(user, PROFILE, Map.of("lastName", "   ")).andExpect(status().isBadRequest());
    }

    @Test
    void omittedNamesStayUnchanged() throws Exception {
        client.patch(user, PROFILE, Map.of("bio", "Coureur"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Test"));
    }

    @Test
    void heightOf300IsRejectedLikeTheDatabaseDoes() throws Exception {
        client.patch(user, PROFILE, Map.of("heightCm", 300)).andExpect(status().isBadRequest());
    }

    @Test
    void heightWithMoreThanOneDecimalIsRejected() throws Exception {
        client.patch(user, PROFILE, Map.of("heightCm", 181.456)).andExpect(status().isBadRequest());
    }

    @Test
    void validHeightIsReturnedAsStored() throws Exception {
        client.patch(user, PROFILE, Map.of("heightCm", 299.9))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.heightCm").value(299.9));
    }
}
