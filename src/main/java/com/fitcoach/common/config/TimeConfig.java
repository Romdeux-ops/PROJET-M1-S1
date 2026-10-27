package com.fitcoach.common.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Horloge unique de l'application.
 *
 * <p>Les notions metier "aujourd'hui" ou "cette semaine" dependent du fuseau de
 * l'utilisateur, pas de celui de la JVM : tout calcul de date passe par ce
 * {@link Clock}, ce qui le rend aussi remplacable par une horloge fixe en test.
 */
@Configuration(proxyBeanMethods = false)
public class TimeConfig {

    @Bean
    @ConditionalOnMissingBean
    Clock clock(@Value("${app.time-zone}") ZoneId zone) {
        return Clock.system(zone);
    }
}
