# UBAN HARKALLA E-Commerce Platform

A modern, responsive, and production-ready full-stack e-commerce web application for **UBAN HARKALLA**, a premier Nigerian retail destination for Apple iPhones, Android smartphones, electronic gadgets, and accessories.

---

## 📱 Project Overview

UBAN HARKALLA delivers a seamless, high-trust digital shopping experience for smartphone enthusiasts and retail customers across Nigeria, backed by an authoritative administrative management suite.

### Key Highlights
- **100% Functional Full-Stack Experience:** Live shopping cart, dynamic variation matrix (Storage, Color, Condition, RAM), real-time stock tracking, Nigerian state delivery fee calculations, and administrative order fulfillment.
- **Authentic Brand Integration:** Built around the official UBAN HARKALLA visual identity, including the official logo (`Logo.jpg`), official CEO photograph (`About CEO Image.jpg`), store inventory photography, and the official brand audio welcome experience (`UBAN HARKALLA MP3.mp3`).
- **Neon Serverless PostgreSQL Database:** Powered by Neon Serverless PostgreSQL (`@neondatabase/serverless`) via HTTPS with the complete database schema (`neon/schema.sql`), atomic order operations, audit logging, and resilient local-first fallback capabilities for instant offline testing.
- **Modern Scroll Transitions & Dynamic Visuals:** Hardware-accelerated intersection observer reveal animations (`ScrollReveal.jsx`), interactive 3D perspective cards (`TiltCard.jsx`), automated flagship device carousel slider, and portal-based variation modal (`QuickViewModal.jsx`).
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
7. **Browser Autoplay Protection:** If modern browser policies block autoplay with sound, an elegant toast notification appears with a **"Play Audio"** button.
8. **Global Audio Widget:** A non-intrusive floating audio control bar allows users to play, pause, mute/unmute, and adjust volume at any time without interfering with checkout or navigation.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create or update your `.env` file in the project root:
```env
# Neon Serverless PostgreSQL Database Connection
# Format: postgresql://[user]:[password]@[ep-xyz].us-east-2.aws.neon.tech/neondb?sslmode=require
# (Leave empty to use built-in standalone storage mode)
VITE_NEON_DATABASE_URL=

# Paystack Test Public Key (Replace with your actual public key)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_sample_uban_harkalla_key

# Store Configuration Defaults
VITE_STORE_NAME=UBAN HARKALLA
VITE_STORE_PHONE=+234 812 345 6789
VITE_STORE_EMAIL=contact@ubanharkalla.com
VITE_STORE_ADDRESS=Plot 12, Commercial District, Kano, Nigeria
```

### 4. Run the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000` (or Vite's designated port).

### 5. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🔐 Authentication & Access Portals

The platform provides secure, role-based access for customers and administrative staff, complete with interactive password mask/unmask visibility toggles:

| Portal | URL Route | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **Customer Portal** | `/login` / `/signup` | Customer | Order history, real-time tracking, saved delivery addresses, and personal profile management |
| **Staff & Admin Portal** | `/admin/login` | Staff / Admin | Complete administrative store control: product matrix, inventory stock, order fulfillment, delivery zones, and customer records |

> **Security & Privacy Note:** Sensitive credentials and environment configurations are strictly managed through local environment files (`.env`) and Neon secret management. Plaintext passwords or connection secrets are never stored in source control.

---

## 🗄️ Neon PostgreSQL Setup & Deployment

The complete production SQL migration is provided at `neon/schema.sql`.

### Tables Included
1. `users` (User profiles, password hashes, and role assignments: `customer`, `admin`, `super_admin`)
2. `categories` & `brands` (Active categories and manufacturers)
3. `products` & `product_variations` (Dynamic multi-attribute matrix with price, discounted price, SKU, stock, and photography per variation)
4. `delivery_locations` (State shipping fees and pickup routes)
5. `orders` & `order_items` (Order tracking & fulfillment status history)
6. `website_content` (Dynamic CMS for headlines, hero content, and CEO details)
7. `testimonials` (Customer reviews with approval workflow)
8. `business_settings` (Store operating hours, contact information, and bank transfer credentials)
9. `audit_logs` (Administrative action tracking)

### Automated Setup & Verification
Run the automated deployment and verification scripts:
```bash
# Apply schema and seed data directly to Neon
node scripts/migrate-neon.mjs

# Verify all 16 tables and perform round-trip CRUD verification
node scripts/verify-e2e-neon.mjs
```

Or connect manually:
1. Open your Neon project dashboard at [https://console.neon.tech](https://console.neon.tech).
2. Open the **SQL Editor** tab.
3. Paste the contents of `neon/schema.sql` and click **Run**.
4. In your `.env` file, supply your project connection string:
   ```env
   VITE_NEON_DATABASE_URL=postgresql://<user>:<password>@<endpoint>.neon.tech/neondb?sslmode=require
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

Delivery rates are retrieved dynamically from the database configuration:
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
- **Backend / Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Animations:** CSS 3D Transforms, Hardware-Accelerated Intersection Observer
- **Tooling:** Vite 6, PostCSS, Autoprefixer

---

© 2026 UBAN HARKALLA. All rights reserved.
