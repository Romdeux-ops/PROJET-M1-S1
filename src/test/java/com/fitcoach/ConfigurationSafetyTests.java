package com.fitcoach;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;

/**
 * Garde-fous de la configuration de base, valable pour tout deploiement : elle
 * ne doit ni activer de profil de developpement, ni fournir de secret par
 * defaut. Seuls application-dev.yml et application-test.yml en ont un.
 */
class ConfigurationSafetyTests {

    private final PropertySource<?> baseConfig = load();

    @Test
    void noProfileIsActivatedByDefault() {
        assertThat(baseConfig.getProperty("spring.profiles.default")).isNull();
        assertThat(baseConfig.getProperty("spring.profiles.active")).isNull();
    }

    @Test
    void jwtSecretHasNoFallbackValue() {
        assertThat(baseConfig.getProperty("app.jwt.secret")).hasToString("${JWT_SECRET}");
    }

    @Test
    void instantsAreStoredInUtc() {
        assertThat(baseConfig.getProperty("spring.jpa.properties.hibernate.jdbc.time_zone")).hasToString("UTC");
    }

    private static PropertySource<?> load() {
        try {
            return new YamlPropertySourceLoader()
                    .load("application", new ClassPathResource("application.yml"))
                    .getFirst();
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
