package com.fitcoach.coaching;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fitcoach.support.ApiClient;
import com.fitcoach.support.TestUsers.Registered;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/** Une image de publication n'est lisible que par son coach et ses athletes actifs. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PostImageAccessTests {

    private static final byte[] PNG = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    @Autowired
    private MockMvc mockMvc;

    private ApiClient client;
    private Registered coach;
    private Registered athlete;
    private String imagePath;

    @BeforeEach
    void publishPostWithImage() throws Exception {
        client = new ApiClient(mockMvc);
        coach = client.register("COACH");
        athlete = client.register("ATHLETE");
        client.attachCoach(coach, athlete);

        String storedPath = client.json(client.perform(
                                coach,
                                MockMvcRequestBuilders.multipart("/api/coaching/posts/images")
                                        .file(new MockMultipartFile("file", "photo.png", "image/png", PNG))
                                        .with(SecurityMockMvcRequestPostProcessors.csrf()))
                        .andExpect(status().isOk()))
                .get("imageUrl")
                .asText();
        assertThat(storedPath).startsWith("posts/" + coach.id() + "/");

        imagePath = client.json(client.post(
                                coach, "/api/coaching/posts", Map.of("content", "Avec image", "imageUrl", storedPath))
                        .andExpect(status().isCreated()))
                .get("imageUrl")
                .asText();
    }

    @Test
    void coachAndActiveAthletesCanReadTheImage() throws Exception {
        for (Registered reader : new Registered[] {coach, athlete}) {
            client.get(reader, imagePath)
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "image/png"))
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "max-age=3600, private"));
        }
    }

    @Test
    void othersAreRejected() throws Exception {
        client.get(client.register("ATHLETE"), imagePath).andExpect(status().isForbidden());
        client.get(null, imagePath).andExpect(status().isUnauthorized());
    }

    @Test
    void onlyGeneratedFileNamesAreAccepted() throws Exception {
        String coachImages = "/api/coaching/posts/images/" + coach.id() + "/";
        client.get(coach, coachImages + "photo.png").andExpect(status().isBadRequest());
        client.get(coach, coachImages + "..%2F..%2Fapplication.yml").andExpect(status().isBadRequest());
        client.get(coach, coachImages + "00000000-0000-0000-0000-000000000000.png").andExpect(status().isNotFound());
    }

    @Test
    void aPostCannotReferenceAnotherCoachsImage() throws Exception {
        Registered otherCoach = client.register("COACH");
        String foreignPath = "posts/" + coach.id() + "/" + imagePath.substring(imagePath.lastIndexOf('/') + 1);
        client.post(otherCoach, "/api/coaching/posts", Map.of("content", "Vol", "imageUrl", foreignPath))
                .andExpect(status().isBadRequest());
    }
}
