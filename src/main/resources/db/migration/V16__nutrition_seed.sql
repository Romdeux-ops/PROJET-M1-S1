
-- Catalogue alimentaire initial du module Nutrition.
-- Valeurs nutritionnelles indicatives pour 100 g.
-- Les aliments crus et cuits sont distingues.

INSERT INTO foods (
    id,
    name,
    category,
    calories_kcal,
    protein_g,
    carbohydrates_g,
    fat_g,
    fiber_g
)
VALUES
    -- VIANDES
    (gen_random_uuid(), 'Blanc de poulet cuit', 'MEAT', 165, 31, 0, 3.6, 0),
    (gen_random_uuid(), 'Dinde cuite', 'MEAT', 135, 29, 0, 1.6, 0),
    (gen_random_uuid(), 'Steak hache 5%', 'MEAT', 137, 21.4, 0, 5, 0),
    (gen_random_uuid(), 'Steak hache 15%', 'MEAT', 215, 19, 0, 15, 0),
    (gen_random_uuid(), 'Jambon blanc', 'MEAT', 115, 20, 1, 3.5, 0),
    (gen_random_uuid(), 'Filet de porc cuit', 'MEAT', 143, 26, 0, 3.5, 0),

    -- POISSONS
    (gen_random_uuid(), 'Saumon cru', 'FISH', 208, 20, 0, 13, 0),
    (gen_random_uuid(), 'Thon au naturel', 'FISH', 116, 25.5, 0, 0.8, 0),
    (gen_random_uuid(), 'Cabillaud cru', 'FISH', 82, 18, 0, 0.7, 0),
    (gen_random_uuid(), 'Crevettes cuites', 'FISH', 99, 24, 0.2, 0.3, 0),
    (gen_random_uuid(), 'Sardines a huile egouttees', 'FISH', 208, 24.6, 0, 11.5, 0),

    -- OEUFS ET PRODUITS LAITIERS
    (gen_random_uuid(), 'Oeuf entier', 'DAIRY_EGGS', 143, 12.6, 0.7, 9.5, 0),
    (gen_random_uuid(), 'Blanc oeuf', 'DAIRY_EGGS', 52, 10.9, 0.7, 0.2, 0),
    (gen_random_uuid(), 'Lait demi-ecreme', 'DAIRY_EGGS', 46, 3.2, 4.8, 1.6, 0),
    (gen_random_uuid(), 'Fromage blanc 0%', 'DAIRY_EGGS', 46, 8, 4, 0.2, 0),
    (gen_random_uuid(), 'Skyr nature', 'DAIRY_EGGS', 60, 10, 4, 0.2, 0),
    (gen_random_uuid(), 'Yaourt grec nature', 'DAIRY_EGGS', 97, 9, 4, 5, 0),
    (gen_random_uuid(), 'Mozzarella', 'DAIRY_EGGS', 250, 18, 2, 19, 0),
    (gen_random_uuid(), 'Emmental', 'DAIRY_EGGS', 380, 28, 0.5, 29, 0),

    -- CEREALES ET FECULENTS
    (gen_random_uuid(), 'Riz blanc cuit', 'GRAINS', 130, 2.7, 28, 0.3, 0.4),
    (gen_random_uuid(), 'Riz blanc cru', 'GRAINS', 365, 7.1, 80, 0.7, 1.3),
    (gen_random_uuid(), 'Pates cuites', 'GRAINS', 158, 5.8, 30.9, 0.9, 1.8),
    (gen_random_uuid(), 'Pates crues', 'GRAINS', 350, 12, 72, 1.5, 3),
    (gen_random_uuid(), 'Flocons avoine', 'GRAINS', 389, 16.9, 66.3, 6.9, 10.6),
    (gen_random_uuid(), 'Pain complet', 'GRAINS', 247, 13, 41, 3.4, 7),
    (gen_random_uuid(), 'Pomme de terre cuite', 'GRAINS', 87, 1.9, 20.1, 0.1, 1.8),
    (gen_random_uuid(), 'Patate douce cuite', 'GRAINS', 90, 2, 20.7, 0.2, 3.3),
    (gen_random_uuid(), 'Quinoa cuit', 'GRAINS', 120, 4.4, 21.3, 1.9, 2.8),

    -- LEGUMES
    (gen_random_uuid(), 'Brocoli', 'VEGETABLES', 34, 2.8, 6.6, 0.4, 2.6),
    (gen_random_uuid(), 'Carotte', 'VEGETABLES', 41, 0.9, 9.6, 0.2, 2.8),
    (gen_random_uuid(), 'Courgette', 'VEGETABLES', 17, 1.2, 3.1, 0.3, 1),
    (gen_random_uuid(), 'Tomate', 'VEGETABLES', 18, 0.9, 3.9, 0.2, 1.2),
    (gen_random_uuid(), 'Epinards', 'VEGETABLES', 23, 2.9, 3.6, 0.4, 2.2),
    (gen_random_uuid(), 'Haricots verts', 'VEGETABLES', 31, 1.8, 7, 0.2, 2.7),
    (gen_random_uuid(), 'Poivron rouge', 'VEGETABLES', 31, 1, 6, 0.3, 2.1),

    -- FRUITS
    (gen_random_uuid(), 'Banane', 'FRUITS', 89, 1.1, 22.8, 0.3, 2.6),
    (gen_random_uuid(), 'Pomme', 'FRUITS', 52, 0.3, 13.8, 0.2, 2.4),
    (gen_random_uuid(), 'Orange', 'FRUITS', 47, 0.9, 11.8, 0.1, 2.4),
    (gen_random_uuid(), 'Fraise', 'FRUITS', 32, 0.7, 7.7, 0.3, 2),
    (gen_random_uuid(), 'Myrtille', 'FRUITS', 57, 0.7, 14.5, 0.3, 2.4),
    (gen_random_uuid(), 'Kiwi', 'FRUITS', 61, 1.1, 14.7, 0.5, 3),
    (gen_random_uuid(), 'Mangue', 'FRUITS', 60, 0.8, 15, 0.4, 1.6),

    -- LEGUMINEUSES ET PROTEINES VEGETALES
    (gen_random_uuid(), 'Lentilles cuites', 'LEGUMES', 116, 9, 20.1, 0.4, 7.9),
    (gen_random_uuid(), 'Pois chiches cuits', 'LEGUMES', 164, 8.9, 27.4, 2.6, 7.6),
    (gen_random_uuid(), 'Haricots rouges cuits', 'LEGUMES', 127, 8.7, 22.8, 0.5, 6.4),
    (gen_random_uuid(), 'Tofu ferme', 'LEGUMES', 144, 17.3, 2.8, 8.7, 2.3),

    -- MATIERES GRASSES ET OLEAGINEUX
    (gen_random_uuid(), 'Huile olive', 'FATS', 884, 0, 0, 100, 0),
    (gen_random_uuid(), 'Amandes', 'FATS', 579, 21.2, 21.6, 49.9, 12.5),
    (gen_random_uuid(), 'Beurre de cacahuete', 'FATS', 588, 25, 20, 50, 6),
    (gen_random_uuid(), 'Avocat', 'FATS', 160, 2, 8.5, 14.7, 6.7)

ON CONFLICT (name) DO NOTHING;
