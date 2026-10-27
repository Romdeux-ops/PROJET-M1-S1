package com.fitcoach.support;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/**
 * Horloge figee pour les tests dependant de "aujourd'hui" : a importer via
 * {@code @Import(FixedClockConfig.class)}.
 *
 * <p>Le lundi 13 janvier 2025 a 00h30 a Paris est encore le dimanche 12 en
 * UTC : un calcul qui oublierait le fuseau metier se trompe de jour, et donc de
 * semaine pour les agregats hebdomadaires.
 */
@TestConfiguration(proxyBeanMethods = false)
public class FixedClockConfig {

    public static final ZoneId ZONE = ZoneId.of("Europe/Paris");
    public static final Instant NOW = Instant.parse("2025-01-12T23:30:00Z");

    @Bean
    @Primary
    Clock fixedClock() {
        return Clock.fixed(NOW, ZONE);
    }
}
