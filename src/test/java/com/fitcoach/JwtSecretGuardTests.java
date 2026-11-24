package com.fitcoach;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fitcoach.common.security.JwtSecretGuard;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

/** Hors profils dev et test, l'application refuse de demarrer avec un secret JWT connu. */
class JwtSecretGuardTests {

    private static final String DEV_SECRET = "dev-only-secret-key-please-rotate-32bytes-min";
    private static final String TEST_SECRET = "test-only-secret-key-please-rotate-32bytes-min";
    private static final String STRONG_SECRET = "a-real-production-secret-of-at-least-32-bytes!";

    @Test
    void refusesTheDevSecretWithoutDevProfile() {
        assertThatThrownBy(() -> new JwtSecretGuard(env(), DEV_SECRET)).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new JwtSecretGuard(env("prod"), DEV_SECRET)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void refusesTheTestSecretAndABlankSecretWithoutDevOrTestProfile() {
        assertThatThrownBy(() -> new JwtSecretGuard(env("prod"), TEST_SECRET)).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new JwtSecretGuard(env("prod"), "  ")).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void acceptsAStrongSecretOutsideDev() {
        assertThatCode(() -> new JwtSecretGuard(env("prod"), STRONG_SECRET)).doesNotThrowAnyException();
        assertThatCode(() -> new JwtSecretGuard(env(), STRONG_SECRET)).doesNotThrowAnyException();
    }

    @Test
    void acceptsTheKnownSecretsInDevAndTest() {
        assertThatCode(() -> new JwtSecretGuard(env("dev"), DEV_SECRET)).doesNotThrowAnyException();
        assertThatCode(() -> new JwtSecretGuard(env("test"), TEST_SECRET)).doesNotThrowAnyException();
    }

    private static MockEnvironment env(String... profiles) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profiles);
        return environment;
    }
}
