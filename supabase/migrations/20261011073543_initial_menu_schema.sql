-- =============================================================
-- Migration: Initial Menu Schema
-- Tables:    menu_categories, food_menu
-- =============================================================

-- -------------------------------------------------------------
-- 1. menu_categories
-- -------------------------------------------------------------
CREATE TABLE menu_categories (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            TEXT        NOT NULL UNIQUE,
    description     TEXT,
    display_order   INTEGER     NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. food_menu
-- -------------------------------------------------------------
CREATE TABLE food_menu (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id     BIGINT      NOT NULL
                    REFERENCES menu_categories (id) ON DELETE RESTRICT,
    name            TEXT        NOT NULL,
    description     TEXT,
    price           NUMERIC(10, 2) NOT NULL
                    CONSTRAINT food_menu_price_non_negative CHECK (price >= 0),
    image_url       TEXT,
    food_type       TEXT        NOT NULL
                    CONSTRAINT food_menu_food_type_check
                    CHECK (food_type IN ('VEG', 'NON_VEG', 'EGG')),
    is_available    BOOLEAN     NOT NULL DEFAULT TRUE,
    display_order   INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient lookups by category
CREATE INDEX idx_food_menu_category_id ON food_menu (category_id);

-- -------------------------------------------------------------
-- 3. Row Level Security
-- -------------------------------------------------------------
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu       ENABLE ROW LEVEL SECURITY;
