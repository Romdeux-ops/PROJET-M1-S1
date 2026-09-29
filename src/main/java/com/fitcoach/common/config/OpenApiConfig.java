package com.fitcoach.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI fitCoachOpenApi() {
        return new OpenAPI().info(new Info()
                .title("FitCoach API")
                .version("v1")
                .description("""
                        API de l'application fitness mettant en relation athletes et coachs :
                        carnet d'entrainement, programmes, planning, statistiques, coaching,
                        reservation de creneaux, messagerie et generation de programmes par IA.
                        """)
                .contact(new Contact().name("Equipe FitCoach"))
                .license(new License().name("Projet etudiant")));
    }
}
