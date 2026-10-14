-- ============================================================================
-- Cafe Connect System - Database Schema
-- Simplified to ONLY the required columns matching frontend models
-- Database: PostgreSQL / Supabase
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOMERS TABLE (UserProfile)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    address TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================================================
-- 2. CATEGORIES TABLE (FoodCategory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 3. FOOD MENU TABLE (FoodItem)
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    food_type VARCHAR(20) NOT NULL DEFAULT 'NONVEG',
    rating NUMERIC(3, 1) DEFAULT 4.5,
    prep_time INT DEFAULT 15,
    stock INT,
    daily_limits JSONB,
    last_stock_reset VARCHAR(32)
);

CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);
CREATE INDEX IF NOT EXISTS idx_food_items_available ON food_items(available);

-- ============================================================================
-- 4. DELIVERY LOCATIONS TABLE (DeliveryLocation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_locations (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    requires_meal_type BOOLEAN NOT NULL DEFAULT FALSE,
    offers_breakfast BOOLEAN DEFAULT FALSE,
    offers_lunch BOOLEAN DEFAULT FALSE,
    offers_dinner BOOLEAN DEFAULT FALSE,
    breakfast_cutoff TIME,
    lunch_cutoff TIME,
    dinner_cutoff TIME,
    active BOOLEAN NOT NULL DEFAULT FALSE
);

-- Existing DBs: drop old type/cutoff defaults
ALTER TABLE delivery_locations ALTER COLUMN type DROP DEFAULT;
ALTER TABLE delivery_locations ALTER COLUMN breakfast_cutoff DROP DEFAULT;
ALTER TABLE delivery_locations ALTER COLUMN lunch_cutoff DROP DEFAULT;
ALTER TABLE delivery_locations ALTER COLUMN dinner_cutoff DROP DEFAULT;

-- ============================================================================
-- 5. ORDERS & ORDER ITEMS TABLES (Order & CartItem)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Placed',
    date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'UPI',
    delivery_man_name VARCHAR(120),
    delivery_man_phone VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_id VARCHAR(64) REFERENCES food_items(id) ON DELETE SET NULL,
    food_name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================================
-- 6. DELIVERY PARTNERS TABLE (DeliveryPartner)
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_partners (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 7. OFFERS TABLE (Offer)
-- ============================================================================
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order NUMERIC(10, 2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================================
-- 8. STORE SETTINGS TABLE (StoreSettings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_settings (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    reopen_date VARCHAR(64) DEFAULT '',
    close_reason TEXT DEFAULT '',
    close_type VARCHAR(32) NOT NULL DEFAULT 'TOTAL'
);

-- ============================================================================
-- 9. ADMIN USERS TABLE (AdminUser)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username VARCHAR(64) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

