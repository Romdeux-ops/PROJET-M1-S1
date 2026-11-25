
-- =============================================================================
-- V17 : module Nutrition
-- Catalogue alimentaire, journal des repas, objectifs nutritionnels et recettes.
-- Les valeurs nutritionnelles des aliments sont exprimees pour 100 g.
-- Les quantites sont stockees en grammes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Catalogue commun des aliments
-- -----------------------------------------------------------------------------
CREATE TABLE foods (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                text NOT NULL UNIQUE,
    category            text,
    calories_kcal       numeric(8,2) NOT NULL CHECK (calories_kcal >= 0),
    protein_g           numeric(8,2) NOT NULL CHECK (protein_g >= 0),
    carbohydrates_g     numeric(8,2) NOT NULL CHECK (carbohydrates_g >= 0),
    fat_g               numeric(8,2) NOT NULL CHECK (fat_g >= 0),
    fiber_g             numeric(8,2) NOT NULL DEFAULT 0 CHECK (fiber_g >= 0),
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_foods_name ON foods (name);
CREATE INDEX idx_foods_category ON foods (category);


-- -----------------------------------------------------------------------------
-- Objectifs nutritionnels d'un utilisateur
-- -----------------------------------------------------------------------------
CREATE TABLE nutrition_plans (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    calories_goal       numeric(8,2) NOT NULL CHECK (calories_goal > 0),
    protein_goal_g      numeric(8,2) NOT NULL CHECK (protein_goal_g >= 0),
    carbohydrates_goal_g numeric(8,2) NOT NULL CHECK (carbohydrates_goal_g >= 0),
    fat_goal_g          numeric(8,2) NOT NULL CHECK (fat_goal_g >= 0),
    fiber_goal_g        numeric(8,2) CHECK (fiber_goal_g IS NULL OR fiber_goal_g >= 0),
    valid_from          date NOT NULL DEFAULT CURRENT_DATE,
    valid_to            date,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_nutrition_plan_dates
        CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX idx_nutrition_plans_user_dates
    ON nutrition_plans (user_id, valid_from DESC);

CREATE TRIGGER trg_nutrition_plans_updated_at
    BEFORE UPDATE ON nutrition_plans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Journal des repas
-- -----------------------------------------------------------------------------
CREATE TABLE meal_logs (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    meal_type           text NOT NULL
                        CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
    consumed_at         timestamptz NOT NULL DEFAULT now(),
    notes               text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meal_logs_user_date
    ON meal_logs (user_id, consumed_at DESC);

CREATE TRIGGER trg_meal_logs_updated_at
    BEFORE UPDATE ON meal_logs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Aliments consommes lors d'un repas
-- Les valeurs nutritionnelles sont des snapshots pour la quantite consommee.
-- Une modification ulterieure du catalogue ne change donc pas l'historique.
-- -----------------------------------------------------------------------------
CREATE TABLE meal_log_items (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_log_id         uuid NOT NULL REFERENCES meal_logs (id) ON DELETE CASCADE,
    food_id             uuid NOT NULL REFERENCES foods (id) ON DELETE RESTRICT,
    food_name_snapshot  text NOT NULL,
    quantity_g          numeric(8,2) NOT NULL CHECK (quantity_g > 0),
    calories_kcal       numeric(10,2) NOT NULL CHECK (calories_kcal >= 0),
    protein_g           numeric(10,2) NOT NULL CHECK (protein_g >= 0),
    carbohydrates_g     numeric(10,2) NOT NULL CHECK (carbohydrates_g >= 0),
    fat_g               numeric(10,2) NOT NULL CHECK (fat_g >= 0),
    fiber_g             numeric(10,2) NOT NULL DEFAULT 0 CHECK (fiber_g >= 0),
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meal_log_items_meal
    ON meal_log_items (meal_log_id);


-- -----------------------------------------------------------------------------
-- Recettes personnelles (privees par defaut)
-- -----------------------------------------------------------------------------
CREATE TABLE recipes (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name                text NOT NULL,
    description         text,
    servings            integer NOT NULL DEFAULT 1 CHECK (servings > 0),
    preparation_minutes integer CHECK (
                            preparation_minutes IS NULL OR preparation_minutes > 0
                        ),
    instructions        text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recipes_user
    ON recipes (user_id, created_at DESC);

CREATE TRIGGER trg_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------------------
-- Ingredients d'une recette
-- Les quantites sont en grammes et les aliments viennent du catalogue commun.
-- -----------------------------------------------------------------------------
CREATE TABLE recipe_items (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id           uuid NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    food_id             uuid NOT NULL REFERENCES foods (id) ON DELETE RESTRICT,
    quantity_g          numeric(8,2) NOT NULL CHECK (quantity_g > 0),
    position            integer NOT NULL DEFAULT 0 CHECK (position >= 0),
    CONSTRAINT uq_recipe_item_position UNIQUE (recipe_id, position)
);

CREATE INDEX idx_recipe_items_recipe
    ON recipe_items (recipe_id);
