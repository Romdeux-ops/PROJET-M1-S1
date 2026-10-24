package com.fitcoach.common.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Sert les fichiers uploades (avatars) en local, sous {@code /uploads/**}. */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String uploadsLocation;

    public StaticResourceConfig(@Value("${app.uploads.dir}") String uploadsDir) {
        this.uploadsLocation = "file:" + Path.of(uploadsDir).toAbsolutePath().normalize() + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**").addResourceLocations(uploadsLocation);
    }
}
