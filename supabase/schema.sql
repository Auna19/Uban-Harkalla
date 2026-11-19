-- ==============================================================================
-- UBAN HARKALLA E-COMMERCE PLATFORM
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH RLS & ATOMIC OPERATIONS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
    role_id UUID REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES & BRANDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS & VARIATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    short_description TEXT,
    description TEXT,
    base_price BIGINT NOT NULL DEFAULT 0, -- price in integer kobo or naira
    discounted_price BIGINT,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g. "Storage", "Color", "Condition"
    code TEXT NOT NULL UNIQUE  -- e.g. "storage", "color", "condition"
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL,       -- e.g. "128GB", "Brand New", "Space Black"
    display_order INT NOT NULL DEFAULT 0,
    UNIQUE(attribute_id, value)
);

CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    price BIGINT NOT NULL,
    discounted_price BIGINT,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.variation_attribute_values (
    variation_id UUID NOT NULL REFERENCES public.product_variations(id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES public.product_attribute_values(id) ON DELETE RESTRICT,
    PRIMARY KEY (variation_id, attribute_value_id)
);

-- ------------------------------------------------------------------------------
-- 4. CUSTOMER ADDRESSES & DELIVERY LOCATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home',
    recipient_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    street_address TEXT NOT NULL,
    additional_info TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.delivery_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state TEXT NOT NULL,
    city TEXT,
    fee BIGINT NOT NULL DEFAULT 0, -- In Naira
    is_active BOOLEAN NOT NULL DEFAULT true,
    estimated_days TEXT DEFAULT '1-3 business days',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. ORDERS & ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT NOT NULL UNIQUE, -- e.g. UBH-2026-00001
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    subtotal BIGINT NOT NULL,
    delivery_fee BIGINT NOT NULL DEFAULT 0,
    discount BIGINT NOT NULL DEFAULT 0,
    total_amount BIGINT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('pay_on_delivery', 'bank_transfer', 'paystack')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('home_delivery', 'physical_pickup')),
    delivery_state TEXT,
    delivery_city TEXT,
    delivery_address TEXT,
    delivery_notes TEXT,
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN (
        'Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'
    )),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variation_details TEXT, -- e.g. "Storage: 256GB | Color: Titanium | Condition: Brand New"
    unit_price BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. PAYMENT TRANSACTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    reference TEXT NOT NULL UNIQUE,
    amount BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    channel TEXT NOT NULL, -- e.g. "paystack", "bank_transfer", "cash_on_delivery"
    status TEXT NOT NULL DEFAULT 'pending',
    paystack_response JSONB,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS, TESTIMONIALS & CONTENT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'order', -- 'order', 'auth', 'system', 'admin'
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_role TEXT DEFAULT 'Verified Customer',
    content TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.website_content (
    key TEXT PRIMARY KEY,
    section TEXT NOT NULL,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.business_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read & edit their own profile; admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Catalog (Public read, admin write)
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins manage brands" ON public.brands FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Public read attributes" ON public.product_attributes FOR SELECT USING (true);
CREATE POLICY "Admins manage attributes" ON public.product_attributes FOR ALL USING (public.is_admin());

CREATE POLICY "Public read attribute values" ON public.product_attribute_values FOR SELECT USING (true);
CREATE POLICY "Admins manage attribute values" ON public.product_attribute_values FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active variations" ON public.product_variations FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage variations" ON public.product_variations FOR ALL USING (public.is_admin());

CREATE POLICY "Public read variation values" ON public.variation_attribute_values FOR SELECT USING (true);
CREATE POLICY "Admins manage variation values" ON public.variation_attribute_values FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active delivery locations" ON public.delivery_locations FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage delivery locations" ON public.delivery_locations FOR ALL USING (public.is_admin());

-- Customer Addresses
CREATE POLICY "Users can view own addresses" ON public.customer_addresses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own addresses" ON public.customer_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.customer_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.customer_addresses FOR DELETE USING (auth.uid() = user_id);

-- Orders: Customer can read their own; admins can read and update all
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own order status history" ON public.order_status_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins can insert status history" ON public.order_status_history FOR INSERT WITH CHECK (public.is_admin());

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System/Admins insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Testimonials & Content
CREATE POLICY "Public view approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true OR public.is_admin());
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "Public submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);

CREATE POLICY "Public view website content" ON public.website_content FOR SELECT USING (true);
CREATE POLICY "Admins manage website content" ON public.website_content FOR ALL USING (public.is_admin());

CREATE POLICY "Public view public business settings" ON public.business_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage business settings" ON public.business_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. INITIAL SEED DATA FOR DELIVERY CHARGES
-- ------------------------------------------------------------------------------
INSERT INTO public.delivery_locations (state, city, fee, is_active, estimated_days) VALUES
('Kano', 'Kano Metropolis & Environs', 0, true, 'Same day - 24 hours'),
('Niger', 'Minna, Suleja & Environs', 3000, true, '1-3 business days'),
('Abuja (FCT)', 'Abuja Municipal, Garki, Wuse, Maitama', 2500, true, '1-2 business days'),
('Katsina', 'Katsina Metropolis', 1500, true, '1-2 business days'),
('Kaduna', 'Kaduna North & South, Zaria', 2000, true, '1-2 business days'),
('Physical Pickup', 'UBAN HARKALLA Main Store', 0, true, 'Ready within 2 hours')
ON CONFLICT DO NOTHING;

-- Initial Categories
INSERT INTO public.categories (name, slug, description, image_url, display_order) VALUES
('iPhones', 'iphones', 'Premium Apple iPhones with official warranty and guaranteed battery health.', '/1001102628.jpg', 1),
('Android Phones', 'android-phones', 'Flagship and budget Android devices from Samsung, Google, Xiaomi & more.', '/1001102629.jpg', 2),
('Other Gadgets', 'gadgets', 'Tablets, smartwatches, earbuds, audio gear, and electronic essentials.', '/1001102635.jpg', 3),
('Accessories', 'accessories', 'Original fast chargers, protective cases, screen guards, and cables.', '/1001102636.jpg', 4)
ON CONFLICT DO NOTHING;
