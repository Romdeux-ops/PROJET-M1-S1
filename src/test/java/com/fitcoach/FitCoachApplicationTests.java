package com.fitcoach;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifie que le contexte demarre, que Flyway applique les migrations sur une
 * base vierge et qu'Hibernate valide le schema obtenu.
 *
 * <p>Tourne sur la base {@code fitcoach_test} du conteneur PostgreSQL de
 * developpement, creee automatiquement par
 * {@code docker/postgres/init/01-create-test-database.sql}. Les tests
 * s'executent donc sur le meme moteur que la production, ce qui est
 * indispensable ici : le schema s'appuie sur des specificites PostgreSQL
 * (citext, gen_random_uuid, et plus tard les contraintes d'exclusion gist du
 * module de reservation) qu'une base en memoire ne reproduirait pas.
 *
 * <p>Le passage a Testcontainers est prevu en phase 14 avec la CI.
 */
@SpringBootTest
@ActiveProfiles("test")
class FitCoachApplicationTests {

    @Test
    void contextLoads() {
    }
}
