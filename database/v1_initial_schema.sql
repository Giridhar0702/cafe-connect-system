BEGIN;

-- =========================================================
-- ELAI VIRUNDHU
-- FOOD CATEGORIES, FOOD MENU & STOCK MANAGEMENT
-- PostgreSQL / Supabase
-- =========================================================


-- =========================================================
-- 1. FOOD CATEGORIES
-- =========================================================

CREATE TABLE public.food_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL
        CHECK (name = BTRIM(name) AND name <> ''),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category names must be unique, ignoring capitalization.
CREATE UNIQUE INDEX uq_food_categories_name
    ON public.food_categories (LOWER(name));


-- =========================================================
-- 2. FOOD MENU ITEMS
-- =========================================================

CREATE TABLE public.food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(200) NOT NULL
        CHECK (name = BTRIM(name) AND name <> ''),

    -- Deleting a category preserves its food items.
    -- The category_id becomes NULL.
    category_id UUID
        REFERENCES public.food_categories(id)
        ON DELETE SET NULL,

    food_type VARCHAR(20) NOT NULL
        CHECK (food_type IN ('veg', 'non_veg', 'egg')),

    price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),

    description TEXT,

    image_url TEXT,

    -- Inactive food items must not appear in the customer menu.
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supports menu retrieval by category, visibility and display order.
CREATE INDEX idx_food_items_category_active_sort
    ON public.food_items (category_id, is_active, sort_order);


-- =========================================================
-- 3. WEEKLY STOCK LIMITS
-- =========================================================

CREATE TABLE public.food_weekly_stock_limits (
    food_item_id UUID NOT NULL
        REFERENCES public.food_items(id)
        ON DELETE CASCADE,

    -- ISO weekday numbering:
    -- Monday = 1, Tuesday = 2, Wednesday = 3,
    -- Thursday = 4, Friday = 5, Saturday = 6, Sunday = 7.
    weekday_iso SMALLINT NOT NULL
        CHECK (weekday_iso BETWEEN 1 AND 7),

    -- NULL = unlimited stock.
    -- 0 = no stock available for that weekday.
    quantity_limit INTEGER
        CHECK (quantity_limit IS NULL OR quantity_limit >= 0),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (food_item_id, weekday_iso)
);


-- =========================================================
-- 4. DAILY STOCK TRACKING
-- =========================================================

CREATE TABLE public.food_daily_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    food_item_id UUID NOT NULL
        REFERENCES public.food_items(id)
        ON DELETE CASCADE,

    stock_date DATE NOT NULL,

    -- Successfully sold quantity for this calendar date.
    quantity_sold INTEGER NOT NULL DEFAULT 0
        CHECK (quantity_sold >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One daily stock record per food item and date.
    CONSTRAINT uq_food_daily_stock_item_date
        UNIQUE (food_item_id, stock_date)
);

-- The UNIQUE constraint already creates an index on
-- (food_item_id, stock_date). Do not create another copy.
CREATE INDEX idx_food_daily_stock_date
    ON public.food_daily_stock (stock_date);


-- =========================================================
-- 5. CHECKOUT STOCK RESERVATIONS
-- =========================================================

CREATE TABLE public.food_stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    daily_stock_id UUID NOT NULL
        REFERENCES public.food_daily_stock(id)
        ON DELETE CASCADE,

    -- Unique identifier generated/managed by the backend
    -- for a particular checkout session.
    checkout_session_id UUID NOT NULL,

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    -- pending: temporarily holds stock
    -- confirmed: payment/order confirmed
    -- released: stock released after cancellation/failure
    -- expired: reservation expired
    status VARCHAR(12) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'released',
                'expired'
            )
        ),

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One reservation record per checkout session
    -- for each food item/date.
    CONSTRAINT uq_food_reservation_session_stock
        UNIQUE (checkout_session_id, daily_stock_id)
);

-- Supports checking unexpired pending reservations for a stock row.
CREATE INDEX idx_food_reservations_stock_status_expiry
    ON public.food_stock_reservations (
        daily_stock_id,
        status,
        expires_at
    );


-- =========================================================
-- 6. AUTOMATIC WEEKLY LIMIT INITIALIZATION
-- =========================================================

-- Every new food item gets seven weekday configurations.
-- All days default to unlimited stock.

CREATE OR REPLACE FUNCTION public.create_default_weekly_stock_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.food_weekly_stock_limits (
        food_item_id,
        weekday_iso,
        quantity_limit
    )
    SELECT
        NEW.id,
        day_number::SMALLINT,
        NULL
    FROM GENERATE_SERIES(1, 7) AS days(day_number);

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_default_weekly_stock_limits
AFTER INSERT ON public.food_items
FOR EACH ROW
EXECUTE FUNCTION public.create_default_weekly_stock_limits();


-- =========================================================
-- 7. AUTOMATIC UPDATED_AT MANAGEMENT
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_food_categories_updated_at
BEFORE UPDATE ON public.food_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_food_items_updated_at
BEFORE UPDATE ON public.food_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_food_weekly_stock_limits_updated_at
BEFORE UPDATE ON public.food_weekly_stock_limits
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_food_daily_stock_updated_at
BEFORE UPDATE ON public.food_daily_stock
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_food_stock_reservations_updated_at
BEFORE UPDATE ON public.food_stock_reservations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- =========================================================
-- 8. DYNAMIC DAILY STOCK STATUS VIEW
-- =========================================================

-- Computes active reservations at query time.
-- Does not store a potentially stale out-of-stock flag.
--
-- NOTE:
-- A daily stock row must exist before the view can report
-- that item's status for that particular date.

CREATE VIEW public.food_daily_stock_status AS
SELECT
    ds.id AS daily_stock_id,
    ds.food_item_id,
    ds.stock_date,

    wsl.quantity_limit,

    ds.quantity_sold,

    COALESCE(reserved.quantity_reserved, 0)::BIGINT
        AS quantity_reserved,

    CASE
        WHEN wsl.quantity_limit IS NULL THEN NULL::BIGINT
        ELSE GREATEST(
            wsl.quantity_limit::BIGINT
                - ds.quantity_sold::BIGINT
                - COALESCE(reserved.quantity_reserved, 0)::BIGINT,
            0::BIGINT
        )
    END AS remaining_quantity,

    CASE
        WHEN wsl.quantity_limit IS NULL THEN FALSE
        ELSE (
            ds.quantity_sold::BIGINT
            + COALESCE(reserved.quantity_reserved, 0)::BIGINT
        ) >= wsl.quantity_limit
    END AS is_out_of_stock

FROM public.food_daily_stock AS ds

JOIN public.food_weekly_stock_limits AS wsl
    ON wsl.food_item_id = ds.food_item_id
   AND wsl.weekday_iso =
       EXTRACT(ISODOW FROM ds.stock_date)::SMALLINT

LEFT JOIN LATERAL (
    SELECT
        COALESCE(SUM(r.quantity), 0)::BIGINT
            AS quantity_reserved
    FROM public.food_stock_reservations AS r
    WHERE r.daily_stock_id = ds.id
      AND r.status = 'pending'
      AND r.expires_at > NOW()
) AS reserved ON TRUE;


COMMIT;

-- =========================================================
-- END OF SCHEMA
-- =========================================================