-- Phase 3 : jeu d'exercices de reference pour un catalogue utilisable en demo.

DELETE FROM exercises WHERE slug = 'developpe-couche';

INSERT INTO exercises (slug, name, description, equipment, difficulty, default_rest_seconds) VALUES
    ('squat-barre', 'Squat barre', 'Squat arriere a la barre, pieds largeur des epaules, descente controlee.', 'Barre, rack', 'INTERMEDIATE', 120),
    ('souleve-de-terre', 'Souleve de terre', 'Tirage du sol a la barre, dos neutre, poussee dans les talons.', 'Barre', 'INTERMEDIATE', 150),
    ('developpe-couche', 'Developpe couche', 'Barre, banc plat, prise ecartee, barre jusqu''au sternum.', 'Barre, banc', 'BEGINNER', 90),
    ('developpe-militaire', 'Developpe militaire', 'Barre ou halteres, debout ou assis, poussee au-dessus de la tete.', 'Barre, halteres', 'INTERMEDIATE', 90),
    ('tirage-horizontal', 'Tirage horizontal', 'A la poulie basse, dos droit, coudes pres du corps.', 'Machine a poulie', 'BEGINNER', 90),
    ('traction', 'Traction pronation', 'Suspendu a la barre, menton au-dessus de la barre.', 'Barre de traction', 'ADVANCED', 120),
    ('fentes', 'Fentes avant', 'Alternees, halteres ou barre, genou arriere pres du sol.', 'Halteres', 'BEGINNER', 60),
    ('presse-a-cuisses', 'Presse a cuisses', 'Machine inclinee, pieds largeur des epaules.', 'Machine', 'BEGINNER', 90),
    ('curl-biceps', 'Curl biceps halteres', 'Debout, coudes fixes le long du corps.', 'Halteres', 'BEGINNER', 60),
    ('extension-triceps-poulie', 'Extension triceps a la poulie', 'Corde ou barre, coudes fixes, poulie haute.', 'Poulie haute', 'BEGINNER', 60),
    ('elevations-laterales', 'Elevations laterales', 'Halteres, bras tendus, montee jusqu''a l''horizontale.', 'Halteres', 'BEGINNER', 60),
    ('crunch', 'Crunch abdominal', 'Au sol ou sur banc, flexion du tronc controlee.', 'Aucun', 'BEGINNER', 45),
    ('gainage-planche', 'Planche (gainage)', 'Isometrique, avant-bras au sol, corps aligne.', 'Aucun', 'BEGINNER', 60),
    ('extension-mollets', 'Extension mollets debout', 'Machine ou halteres, amplitude complete.', 'Machine', 'BEGINNER', 45),
    ('pompes', 'Pompes', 'Poids du corps, mains largeur des epaules.', 'Aucun', 'BEGINNER', 60),
    ('rowing-haltere', 'Rowing haltere unilateral', 'Buste penche, un bras, tirage vers la hanche.', 'Haltere, banc', 'BEGINNER', 75),
    ('hip-thrust', 'Hip thrust', 'Epaules sur banc, barre au bassin, extension de hanche.', 'Barre, banc', 'INTERMEDIATE', 90),
    ('burpees', 'Burpees', 'Enchainement complet au poids du corps.', 'Aucun', 'INTERMEDIATE', 45);

-- Groupes musculaires sollicites (role PRIMARY / SECONDARY).
INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role)
SELECT e.id, m.id, v.role FROM (VALUES
    ('squat-barre', 'QUADS', 'PRIMARY'), ('squat-barre', 'GLUTES', 'PRIMARY'), ('squat-barre', 'HAMSTRINGS', 'SECONDARY'),
    ('souleve-de-terre', 'BACK', 'PRIMARY'), ('souleve-de-terre', 'HAMSTRINGS', 'PRIMARY'), ('souleve-de-terre', 'GLUTES', 'SECONDARY'),
    ('developpe-couche', 'CHEST', 'PRIMARY'), ('developpe-couche', 'TRICEPS', 'SECONDARY'), ('developpe-couche', 'SHOULDERS', 'SECONDARY'),
    ('developpe-militaire', 'SHOULDERS', 'PRIMARY'), ('developpe-militaire', 'TRICEPS', 'SECONDARY'),
    ('tirage-horizontal', 'BACK', 'PRIMARY'), ('tirage-horizontal', 'BICEPS', 'SECONDARY'),
    ('traction', 'BACK', 'PRIMARY'), ('traction', 'BICEPS', 'SECONDARY'),
    ('fentes', 'QUADS', 'PRIMARY'), ('fentes', 'GLUTES', 'PRIMARY'),
    ('presse-a-cuisses', 'QUADS', 'PRIMARY'), ('presse-a-cuisses', 'GLUTES', 'SECONDARY'),
    ('curl-biceps', 'BICEPS', 'PRIMARY'),
    ('extension-triceps-poulie', 'TRICEPS', 'PRIMARY'),
    ('elevations-laterales', 'SHOULDERS', 'PRIMARY'),
    ('crunch', 'ABS', 'PRIMARY'),
    ('gainage-planche', 'ABS', 'PRIMARY'),
    ('extension-mollets', 'CALVES', 'PRIMARY'),
    ('pompes', 'CHEST', 'PRIMARY'), ('pompes', 'TRICEPS', 'SECONDARY'), ('pompes', 'SHOULDERS', 'SECONDARY'),
    ('rowing-haltere', 'BACK', 'PRIMARY'), ('rowing-haltere', 'BICEPS', 'SECONDARY'),
    ('hip-thrust', 'GLUTES', 'PRIMARY'), ('hip-thrust', 'HAMSTRINGS', 'SECONDARY'),
    ('burpees', 'FULL_BODY', 'PRIMARY')
) AS v(slug, muscle_code, role)
JOIN exercises e ON e.slug = v.slug
JOIN muscle_groups m ON m.code = v.muscle_code;

-- Tags.
INSERT INTO exercise_tags (exercise_id, tag_id)
SELECT e.id, t.id FROM (VALUES
    ('squat-barre', 'COMPOUND'), ('squat-barre', 'PUSH'),
    ('souleve-de-terre', 'COMPOUND'), ('souleve-de-terre', 'PULL'),
    ('developpe-couche', 'COMPOUND'), ('developpe-couche', 'PUSH'),
    ('developpe-militaire', 'COMPOUND'), ('developpe-militaire', 'PUSH'),
    ('tirage-horizontal', 'COMPOUND'), ('tirage-horizontal', 'PULL'),
    ('traction', 'COMPOUND'), ('traction', 'PULL'), ('traction', 'BODYWEIGHT'),
    ('fentes', 'COMPOUND'),
    ('presse-a-cuisses', 'COMPOUND'),
    ('curl-biceps', 'ISOLATION'),
    ('extension-triceps-poulie', 'ISOLATION'),
    ('elevations-laterales', 'ISOLATION'),
    ('crunch', 'ISOLATION'), ('crunch', 'BODYWEIGHT'),
    ('gainage-planche', 'ISOLATION'), ('gainage-planche', 'BODYWEIGHT'),
    ('extension-mollets', 'ISOLATION'),
    ('pompes', 'COMPOUND'), ('pompes', 'PUSH'), ('pompes', 'BODYWEIGHT'),
    ('rowing-haltere', 'COMPOUND'), ('rowing-haltere', 'PULL'),
    ('hip-thrust', 'COMPOUND'),
    ('burpees', 'CARDIO'), ('burpees', 'BODYWEIGHT')
) AS v(slug, tag_code)
JOIN exercises e ON e.slug = v.slug
JOIN tags t ON t.code = v.tag_code;

-- Alternatives (si materiel manquant).
INSERT INTO exercise_alternatives (exercise_id, alternative_exercise_id)
SELECT e.id, a.id FROM (VALUES
    ('squat-barre', 'presse-a-cuisses'), ('presse-a-cuisses', 'squat-barre'),
    ('developpe-couche', 'pompes'), ('pompes', 'developpe-couche'),
    ('traction', 'tirage-horizontal'), ('tirage-horizontal', 'traction'),
    ('souleve-de-terre', 'hip-thrust'), ('hip-thrust', 'souleve-de-terre')
) AS v(slug, alt_slug)
JOIN exercises e ON e.slug = v.slug
JOIN exercises a ON a.slug = v.alt_slug;
