package com.fitcoach;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

class ArchitectureTest {

    // Les regles inter-modules (ex: "program" n'accede a "identity" que via ses
    // services/DTOs) ne sont pas encore verifiees ici : plusieurs modules lisent
    // aujourd'hui directement des repositories d'autres modules (cf. revue de
    // code), et les encoder en regle ferait echouer le test sans corriger ce
    // defaut d'architecture plus large. Seule l'independance de "common" est
    // garantie par construction (toute regression serait un vrai regression).

    @Test
    void commonDoesNotDependOnBusinessModules() {
        var classes = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.fitcoach");

        ArchRule rule = noClasses()
                .that()
                .resideInAPackage("com.fitcoach.common..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                        "com.fitcoach.identity..",
                        "com.fitcoach.catalog..",
                        "com.fitcoach.program..",
                        "com.fitcoach.training..",
                        "com.fitcoach.planning..",
                        "com.fitcoach.stats..",
                        "com.fitcoach.coaching..",
                        "com.fitcoach.booking..",
                        "com.fitcoach.messaging..",
                        "com.fitcoach.gamification..",
                        "com.fitcoach.nutrition..",
                        "com.fitcoach.ai..",
                        "com.fitcoach.admin..");

        rule.check(classes);
    }
}
