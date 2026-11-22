-- ==============================================================================
-- UBAN HARKALLA — Supabase PostgreSQL Schema, Security Policies & Seed Data
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/rewguroxxexcboxoywdt
-- 2. Click on "SQL Editor" in the left sidebar navigation.
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- 4. Open the "Table Editor" in the left sidebar to see all tables populated!
-- ==============================================================================

-- 1. Enable UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'customer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    base_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discounted_price NUMERIC(14, 2),
    short_description TEXT,
    description TEXT,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCT VARIATIONS TABLE
CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    price NUMERIC(14, 2) NOT NULL,
    discounted_price NUMERIC(14, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. DELIVERY LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    display_order INT NOT NULL DEFAULT 0,
    estimated_delivery TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_reference TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_method TEXT NOT NULL DEFAULT 'home_delivery',
    delivery_state TEXT NOT NULL DEFAULT 'Kano',
    delivery_city TEXT NOT NULL DEFAULT 'Kano',
    delivery_address TEXT NOT NULL DEFAULT '',
    delivery_notes TEXT,
    subtotal_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    order_status TEXT NOT NULL DEFAULT 'Pending',
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. ORDER ITEMS TABLE (Optional normalized relation)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variation_details TEXT,
    unit_price NUMERIC(14, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. WEBSITE CONTENT & TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.website_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    role_or_title TEXT,
    comment TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    is_featured BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SCHEMA & TABLE PERMISSIONS
-- ==============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert categories" ON public.categories;
CREATE POLICY "Public insert categories" ON public.categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update categories" ON public.categories;
CREATE POLICY "Public update categories" ON public.categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete categories" ON public.categories;
CREATE POLICY "Public delete categories" ON public.categories FOR DELETE TO anon, authenticated USING (true);

-- Brands
DROP POLICY IF EXISTS "Public read brands" ON public.brands;
CREATE POLICY "Public read brands" ON public.brands FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert brands" ON public.brands;
CREATE POLICY "Public insert brands" ON public.brands FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update brands" ON public.brands;
CREATE POLICY "Public update brands" ON public.brands FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete brands" ON public.brands;
CREATE POLICY "Public delete brands" ON public.brands FOR DELETE TO anon, authenticated USING (true);

-- Products
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert products" ON public.products;
CREATE POLICY "Public insert products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update products" ON public.products;
CREATE POLICY "Public update products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete products" ON public.products;
CREATE POLICY "Public delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- Product Variations
DROP POLICY IF EXISTS "Public read product_variations" ON public.product_variations;
CREATE POLICY "Public read product_variations" ON public.product_variations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert product_variations" ON public.product_variations;
CREATE POLICY "Public insert product_variations" ON public.product_variations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update product_variations" ON public.product_variations;
CREATE POLICY "Public update product_variations" ON public.product_variations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete product_variations" ON public.product_variations;
CREATE POLICY "Public delete product_variations" ON public.product_variations FOR DELETE TO anon, authenticated USING (true);

-- Delivery Locations
DROP POLICY IF EXISTS "Public read delivery_locations" ON public.delivery_locations;
CREATE POLICY "Public read delivery_locations" ON public.delivery_locations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert delivery_locations" ON public.delivery_locations;
CREATE POLICY "Public insert delivery_locations" ON public.delivery_locations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update delivery_locations" ON public.delivery_locations;
CREATE POLICY "Public update delivery_locations" ON public.delivery_locations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete delivery_locations" ON public.delivery_locations;
CREATE POLICY "Public delete delivery_locations" ON public.delivery_locations FOR DELETE TO anon, authenticated USING (true);

-- Orders
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete orders" ON public.orders;
CREATE POLICY "Public delete orders" ON public.orders FOR DELETE TO anon, authenticated USING (true);

-- Order Items
DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update order_items" ON public.order_items;
CREATE POLICY "Public update order_items" ON public.order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete order_items" ON public.order_items;
CREATE POLICY "Public delete order_items" ON public.order_items FOR DELETE TO anon, authenticated USING (true);

-- Website Content
DROP POLICY IF EXISTS "Public read website_content" ON public.website_content;
CREATE POLICY "Public read website_content" ON public.website_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public upsert website_content" ON public.website_content;
CREATE POLICY "Public upsert website_content" ON public.website_content FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update website_content" ON public.website_content;
CREATE POLICY "Public update website_content" ON public.website_content FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Testimonials
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert testimonials" ON public.testimonials;
CREATE POLICY "Public insert testimonials" ON public.testimonials FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update testimonials" ON public.testimonials;
CREATE POLICY "Public update testimonials" ON public.testimonials FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete testimonials" ON public.testimonials;
CREATE POLICY "Public delete testimonials" ON public.testimonials FOR DELETE TO anon, authenticated USING (true);

-- Business Settings
DROP POLICY IF EXISTS "Public read business_settings" ON public.business_settings;
CREATE POLICY "Public read business_settings" ON public.business_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert business_settings" ON public.business_settings;
CREATE POLICY "Public insert business_settings" ON public.business_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update business_settings" ON public.business_settings;
CREATE POLICY "Public update business_settings" ON public.business_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Users
DROP POLICY IF EXISTS "Public read users" ON public.users;
CREATE POLICY "Public read users" ON public.users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public insert users" ON public.users;
CREATE POLICY "Public insert users" ON public.users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public delete users" ON public.users;
CREATE POLICY "Public delete users" ON public.users FOR DELETE TO anon, authenticated USING (true);

-- ==============================================================================
-- BASELINE SEED DATA
-- ==============================================================================

-- 1. USERS
INSERT INTO public.users (email, full_name, phone_number, password_hash, role, is_active)
VALUES 
  ('admin@ubanharkalla.com', 'UBAN HARKALLA Super Admin', '08123456789', 'admin123', 'super_admin', true),
  ('inventory@ubanharkalla.com', 'Store Inventory Manager', '08022223344', 'admin123', 'admin', true),
  ('customer@ubanharkalla.com', 'Musa Abdullahi', '08098765432', 'customer123', 'customer', true),
  ('abubakar@test.ng', 'Abubakar Garba', '08031234567', 'Password123!', 'customer', true),
  ('chidi@test.ng', 'Chidi Eze', '08129876543', 'Password123!', 'customer', true),
  ('suspended@test.ng', 'Suspended Account', '07011223344', 'Password123!', 'customer', false)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- 2. CATEGORIES
INSERT INTO public.categories (name, slug, description, image_url, is_active, display_order)
VALUES
  ('iPhones', 'iphones', 'Brand new and premium certified pre-owned Apple iPhones with battery health guarantee.', '/1001102628.jpg', true, 1),
  ('Android Phones', 'android-phones', 'Cutting-edge Android smartphones from Samsung, Google, Xiaomi, and other top global brands.', '/1001102629.jpg', true, 2),
  ('Other Gadgets', 'gadgets', 'Smart watches, wireless audio, premium tablets, and everyday electronic tech essentials.', '/1001102635.jpg', true, 3),
  ('Accessories', 'accessories', 'Original chargers, high-speed cables, protective cases, and durable screen protectors.', '/1001102636.jpg', true, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- 3. BRANDS
INSERT INTO public.brands (name, slug, display_order, is_active)
VALUES
  ('Apple', 'apple', 1, true),
  ('Samsung', 'samsung', 2, true),
  ('Google', 'google', 3, true),
  ('Xiaomi', 'xiaomi', 4, true),
  ('Oraimo', 'oraimo', 5, true),
  ('Anker', 'anker', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 4. DELIVERY LOCATIONS
INSERT INTO public.delivery_locations (state, city, fee, display_order, estimated_delivery, is_active)
VALUES
  ('Kano', 'Kano Metropolis (Same-Day / Free Delivery)', 0, 1, 'Same-day delivery (within 3 hours)', true),
  ('Kaduna', 'Kaduna Central', 2000, 2, 'Next-day delivery (24-48 hours)', true),
  ('Abuja (FCT)', 'Abuja Municipal / Garki / Wuse', 2500, 3, '1-2 business days', true),
  ('Katsina', 'Katsina City', 1500, 4, 'Next-day delivery', true),
  ('Niger', 'Minna / Suleja', 3000, 5, '2-3 business days', true)
ON CONFLICT DO NOTHING;

-- 5. PRODUCTS
DO $$
DECLARE
  v_apple_id UUID;
  v_samsung_id UUID;
  v_google_id UUID;
  v_iphone_cat_id UUID;
  v_android_cat_id UUID;
  v_prod_id UUID;
BEGIN
  SELECT id INTO v_apple_id FROM public.brands WHERE slug = 'apple' LIMIT 1;
  SELECT id INTO v_samsung_id FROM public.brands WHERE slug = 'samsung' LIMIT 1;
  SELECT id INTO v_google_id FROM public.brands WHERE slug = 'google' LIMIT 1;

  SELECT id INTO v_iphone_cat_id FROM public.categories WHERE slug = 'iphones' LIMIT 1;
  SELECT id INTO v_android_cat_id FROM public.categories WHERE slug = 'android-phones' LIMIT 1;

  -- Product 1: iPhone 15 Pro Max
  INSERT INTO public.products (name, slug, base_price, discounted_price, short_description, description, stock_quantity, is_featured, is_active, category_id, brand_id, images)
  VALUES (
    'Apple iPhone 15 Pro Max',
    'apple-iphone-15-pro-max',
    1650000,
    1580000,
    'Forged in titanium, featuring the groundbreaking A17 Pro chip, customizable Action button, and 5x optical telephoto camera.',
    'iPhone 15 Pro Max is the first iPhone to feature an aerospace-grade titanium design. Guaranteed authentic with original box and accessories.',
    50,
    true,
    true,
    v_iphone_cat_id,
    v_apple_id,
    '["/1001102631.jpg", "/1001102630.jpg", "/1001102628.jpg"]'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    discounted_price = EXCLUDED.discounted_price,
    stock_quantity = EXCLUDED.stock_quantity,
    is_featured = EXCLUDED.is_featured
  RETURNING id INTO v_prod_id;

  IF v_prod_id IS NOT NULL THEN
    INSERT INTO public.product_variations (product_id, sku, price, discounted_price, stock_quantity, attributes, image_url, is_active)
    VALUES
      (v_prod_id, 'IPH15PM-256-NAT-NEW', 1650000, 1580000, 30, '{"storage": "256GB", "color": "Natural Titanium", "condition": "Brand New (Sealed)"}'::jsonb, '/1001102628.jpg', true),
      (v_prod_id, 'IPH15PM-256-BLK-NEW', 1650000, 1580000, 20, '{"storage": "256GB", "color": "Space Black", "condition": "Brand New (Sealed)"}'::jsonb, '/1001102630.jpg', true)
    ON CONFLICT (sku) DO UPDATE SET
      price = EXCLUDED.price,
      discounted_price = EXCLUDED.discounted_price,
      stock_quantity = EXCLUDED.stock_quantity;
  END IF;

  -- Product 2: Samsung Galaxy S24 Ultra
  INSERT INTO public.products (name, slug, base_price, discounted_price, short_description, description, stock_quantity, is_featured, is_active, category_id, brand_id, images)
  VALUES (
    'Samsung Galaxy S24 Ultra',
    'samsung-galaxy-s24-ultra',
    1750000,
    1680000,
    'Galaxy AI is here. Epic Titanium shield, 200MP camera with ProVisual Engine, and embedded S-Pen stylus.',
    'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display screen.',
    35,
    true,
    true,
    v_android_cat_id,
    v_samsung_id,
    '["/1001102629.jpg", "/1001102633.jpg"]'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    discounted_price = EXCLUDED.discounted_price,
    stock_quantity = EXCLUDED.stock_quantity,
    is_featured = EXCLUDED.is_featured
  RETURNING id INTO v_prod_id;

  IF v_prod_id IS NOT NULL THEN
    INSERT INTO public.product_variations (product_id, sku, price, discounted_price, stock_quantity, attributes, image_url, is_active)
    VALUES
      (v_prod_id, 'S24U-256-GRY-NEW', 1750000, 1680000, 20, '{"storage": "256GB", "color": "Titanium Gray", "condition": "Brand New (Sealed)"}'::jsonb, '/1001102629.jpg', true),
      (v_prod_id, 'S24U-512-BLK-NEW', 1950000, 1880000, 15, '{"storage": "512GB", "color": "Phantom Black", "condition": "Brand New (Sealed)"}'::jsonb, '/1001102633.jpg', true)
    ON CONFLICT (sku) DO UPDATE SET
      price = EXCLUDED.price,
      discounted_price = EXCLUDED.discounted_price,
      stock_quantity = EXCLUDED.stock_quantity;
  END IF;

  -- Product 3: Google Pixel 8 Pro
  INSERT INTO public.products (name, slug, base_price, discounted_price, short_description, description, stock_quantity, is_featured, is_active, category_id, brand_id, images)
  VALUES (
    'Google Pixel 8 Pro',
    'google-pixel-8-pro',
    1150000,
    1080000,
    'Google Tensor G3, advanced AI photo editing with Best Take, Audio Magic Eraser, and all-day battery life.',
    'Pixel 8 Pro is the all-pro phone engineered by Google with state-of-the-art computational photography.',
    25,
    true,
    true,
    v_android_cat_id,
    v_google_id,
    '["/1001102632.jpg"]'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    base_price = EXCLUDED.base_price,
    discounted_price = EXCLUDED.discounted_price,
    stock_quantity = EXCLUDED.stock_quantity,
    is_featured = EXCLUDED.is_featured
  RETURNING id INTO v_prod_id;

  IF v_prod_id IS NOT NULL THEN
    INSERT INTO public.product_variations (product_id, sku, price, discounted_price, stock_quantity, attributes, image_url, is_active)
    VALUES
      (v_prod_id, 'PIX8P-128-BLU-NEW', 1150000, 1080000, 25, '{"storage": "128GB", "color": "Bay Blue", "condition": "Brand New (Sealed)"}'::jsonb, '/1001102632.jpg', true)
    ON CONFLICT (sku) DO UPDATE SET
      price = EXCLUDED.price,
      discounted_price = EXCLUDED.discounted_price,
      stock_quantity = EXCLUDED.stock_quantity;
  END IF;
END $$;
