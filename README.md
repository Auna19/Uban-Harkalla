# UBAN HARKALLA E-Commerce Platform

A modern, responsive, and production-ready full-stack e-commerce web application for **UBAN HARKALLA**, a premier Nigerian retail destination for Apple iPhones, Android smartphones, electronic gadgets, and accessories.

---

## 📱 Project Overview

UBAN HARKALLA delivers a seamless, high-trust digital shopping experience for smartphone enthusiasts and retail customers across Nigeria, backed by an authoritative administrative management suite.

### Key Highlights
- **100% Functional Full-Stack Experience:** Live shopping cart, dynamic variation matrix (Storage, Color, Condition, RAM), atomic stock tracking, state delivery fee calculations, and admin order fulfillment.
- **Authentic Brand Integration:** Built around the official UBAN HARKALLA visual identity, including the official logo (`Logo.jpg`), official CEO photograph (`About CEO Image.jpg`), store inventory photography, and the official brand audio welcome experience (`UBAN HARKALLA MP3.mp3`).
- **Supabase Backend Architecture:** Includes full PostgreSQL database schema (`supabase/schema.sql`) with Row Level Security (RLS) policies, atomic order placement functions, audit logging, and resilient local-first fallback capabilities for instant testing.
- **Nigerian Delivery Logistics:** Dynamic delivery calculation engine with Kano Free Delivery (₦0), Niger (₦3,000), Abuja (₦2,500), Katsina (₦1,500), Kaduna (₦2,000), and Physical Flagship Store Pickup (₦0).
- **Payment Gateway Flexibility:** Support for Paystack (cards, USSD, transfers), direct Nigerian bank transfers (Jaiz / Zenith Bank), and Pay on Delivery.

---

## 🎵 Brand Audio Playback Implementation

The platform features an intelligent, non-intrusive background audio experience adhering to all strict QA acceptance criteria:

1. **First Landing-Page Visit:** Automatically attempts to play the supplied brand audio file once upon arrival.
2. **Page Refresh:** Refreshing the landing page (`F5` or browser reload) triggers a new playback attempt for that fresh page load.
3. **No Looping:** The audio stops completely after its single playback finishes.
4. **Silent In-App Navigation:** Moving between pages (e.g. browsing the shop catalogue, reading About Us, viewing details) never triggers duplicate or automatic playback.
5. **Welcome Experience:** When a customer registers a new account or logs into their existing account, the brand audio plays once as a welcome experience.
6. **No Spurious Triggers:** Merely visiting the login or sign-up page does not trigger audio. Logging out does not trigger audio.
7. **Browser Autoplay Protection:** If modern browser policies block autoplay with sound, an elegant, subtle toast notification appears with a **"Play Audio"** button.
8. **Global Audio Widget:** A non-intrusive floating audio control bar allows users to play, pause, mute/unmute, and adjust volume at any time without interfering with checkout or navigation.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v24+)
- **npm** (v9+)

### 2. Run the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or the port specified by Vite).

### 3. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔐 Pre-Configured Accounts for Instant Evaluation

The system comes pre-seeded with verified test accounts:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@ubanharkalla.com` | `admin123` | Full administrative control over products, variations, orders, content, delivery, and staff |
| **Customer** | `customer@ubanharkalla.com` | `customer123` | Customer dashboard, saved addresses, order history, and personal profile |

> **Note:** The Admin Dashboard can also be directly accessed via `/admin/login`. Ordinary customers cannot access administrative endpoints.

---

## 🗄️ Supabase PostgreSQL Setup & Deployment

The complete production SQL migration is provided at `supabase/schema.sql`.

### Tables Included
1. `profiles` (User profile & role assignment: `customer`, `admin`, `super_admin`)
2. `categories` & `brands` (Active categories and manufacturers)
3. `products`, `product_images`, `product_attributes`, `product_attribute_values`
4. `product_variations` & `variation_attribute_values` (Dynamic multi-attribute matrix with price, discounted price, SKU, stock, and photo per variation)
5. `customer_addresses` (Saved delivery addresses with default selection)
6. `delivery_locations` (State shipping fees and pickup routes)
7. `orders`, `order_items`, `order_status_history` (Order tracking & state progression)
8. `payment_transactions` (Paystack reference logs and bank transfer receipts)
9. `notifications` (Customer and admin notifications)
10. `testimonials` (Customer reviews with approval workflow)
11. `website_content` & `business_settings` (Dynamic CMS for headlines, CEO details, contact information, and store operating hours)
12. `audit_logs` (Administrative action tracking)

### How to Apply Schema in Supabase
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. In your `.env` file, supply your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

---

## 📦 Dynamic Product Variations Matrix

UBAN HARKALLA avoids hardcoded variation options. Every product supports flexible attribute combinations:
- **Storage:** `128GB`, `256GB`, `512GB`, `1TB`
- **Color:** `Natural Titanium`, `Space Black`, `Blue Titanium`, `Deep Purple`, `Titanium Gray`
- **Condition:** `Brand New (Sealed)`, `UK Used (Grade A+)`, `US Used (Pristine)`
- **RAM:** `8GB`, `12GB`, `16GB`

Each variation has its own independent:
- Unit Price & Promotional Discount
- SKU
- Dedicated Stock Units (decrementing atomically upon purchase)
- Variation Image

---

## 🚚 Delivery Logistics & Pickups

Delivery rates are retrieved dynamically from the backend configuration:
- **Kano:** Free Delivery (₦0) — Same day / 24 hours
- **Niger:** ₦3,000 — 1-3 business days
- **Abuja (FCT):** ₦2,500 — 1-2 business days
- **Katsina:** ₦1,500 — 1-2 business days
- **Kaduna:** ₦2,000 — 1-2 business days
- **Physical Pickup:** Free (₦0) — UBAN HARKALLA Main Flagship Store, Kano

---

## 🛠️ Technology Stack
- **Frontend:** React 18, React Router v6, Tailwind CSS
- **Icons:** Lucide React
- **Analytics & Data Visualizations:** Recharts
- **Celebration Effects:** Canvas Confetti
- **Backend / Database:** Supabase (PostgreSQL with Row Level Security)
- **Tooling:** Vite 6, PostCSS, Autoprefixer

---

© 2026 UBAN HARKALLA. All rights reserved.
