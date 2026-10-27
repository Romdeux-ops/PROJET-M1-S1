package com.fitcoach;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import java.util.Optional;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Frontieres du monolithe modulaire : un module ({@code com.fitcoach.<module>})
 * n'utilise un autre module qu'a travers sa facade {@code com.fitcoach.<autre>.api},
 * et {@code common} ne connait aucun module metier.
 */
class ArchitectureTest {

    private static final String ROOT = "com.fitcoach.";
    private static final String COMMON = "common";

    private static JavaClasses productionClasses;

    @BeforeAll
    static void importClasses() {
        productionClasses = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.fitcoach");
    }

    @Test
    void commonDoesNotDependOnBusinessModules() {
        noClasses()
                .that()
                .resideInAPackage("com.fitcoach.common..")
                .should(dependOnABusinessModule())
                .check(productionClasses);
    }

    @Test
    void modulesOnlyUseEachOtherThroughTheirApi() {
        classes()
                .that()
                .resideInAPackage("com.fitcoach.*..")
                .should(onlyDependOnOtherModulesThroughTheirApi())
                .check(productionClasses);
    }

    @Test
    void apiPackagesDoNotExposeModuleInternals() {
        classes()
                .that()
                .resideInAPackage("com.fitcoach.*.api..")
                .should()
                .onlyDependOnClassesThat()
                .resideInAnyPackage("java..", "com.fitcoach.common..", "com.fitcoach.*.api..")
                .check(productionClasses);
    }

    private static ArchCondition<JavaClass> onlyDependOnOtherModulesThroughTheirApi() {
        return new ArchCondition<>("only depend on other modules through their api package") {
            @Override
            public void check(JavaClass origin, ConditionEvents events) {
                for (Dependency dependency : origin.getDirectDependenciesFromSelf()) {
                    JavaClass target = dependency.getTargetClass();
                    if (crossesModuleBoundary(origin, target) && !isApi(target)) {
                        events.add(SimpleConditionEvent.violated(dependency, dependency.getDescription()));
                    }
                }
            }
        };
    }

    private static ArchCondition<JavaClass> dependOnABusinessModule() {
        return new ArchCondition<>("depend on a business module") {
            @Override
            public void check(JavaClass origin, ConditionEvents events) {
                for (Dependency dependency : origin.getDirectDependenciesFromSelf()) {
                    JavaClass target = dependency.getTargetClass();
                    if (moduleOf(target).filter(module -> !module.equals(COMMON)).isPresent()) {
                        events.add(SimpleConditionEvent.satisfied(dependency, dependency.getDescription()));
                    }
                }
            }
        };
    }

    private static boolean crossesModuleBoundary(JavaClass origin, JavaClass target) {
        Optional<String> from = moduleOf(origin);
        Optional<String> to = moduleOf(target);
        return from.isPresent() && to.isPresent() && !to.get().equals(COMMON) && !from.equals(to);
    }

    private static boolean isApi(JavaClass target) {
        return moduleOf(target)
                .map(module -> target.getPackageName().startsWith(ROOT + module + ".api"))
                .orElse(false);
    }

    /** Premier segment sous {@code com.fitcoach}, absent pour les classes hors modules (dont la racine). */
    private static Optional<String> moduleOf(JavaClass javaClass) {
        String packageName = javaClass.getPackageName();
        if (!packageName.startsWith(ROOT)) {
            return Optional.empty();
        }
        String rest = packageName.substring(ROOT.length());
        int dot = rest.indexOf('.');
        return Optional.of(dot < 0 ? rest : rest.substring(0, dot));
    }
}
