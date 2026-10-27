package com.fitcoach.common.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sert les avatars en local, sous {@code /uploads/avatars/**}.
 *
 * <p>Les images de publications ne sont volontairement pas servies ici : elles
 * passent par {@code CoachPostController#getImage}, qui verifie que le
 * visiteur est le coach ou un de ses athletes actifs avant de lire le fichier.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String avatarsLocation;

    public StaticResourceConfig(@Value("${app.uploads.dir}") String uploadsDir) {
        this.avatarsLocation = "file:" + Path.of(uploadsDir, "avatars").toAbsolutePath().normalize() + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/avatars/**").addResourceLocations(avatarsLocation);
    }
}
