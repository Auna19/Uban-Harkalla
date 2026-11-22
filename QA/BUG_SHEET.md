# UBAN HARKALLA — Comprehensive QA Bug Tracking Sheet
**Document Version:** 1.0.0  
**Testing Framework:** Playwright v1.50+ & Chromium Headless Shell  
**Test Target Environment:** Live Vercel Production (`https://uban-harkalla-zeta.vercel.app`) & Local (`http://localhost:3000`)  
**Date of Testing:** November 20, 2026  
**QA Lead:** Antigravity Senior QA Engineer & Automation Architect  

---

## 1. Bug Summary Dashboard

| Bug ID | Component | Severity | Priority | Status | Root Cause |
|---|---|---|---|---|---|
| **BUG-001** | Cart Confirmation Modal | High | P1 (Urgent) | **FIXED & VERIFIED** | Incorrect item name property reference & missing CSS flex truncation wrapping |
| **BUG-002** | Global Navigation Bar | Medium | P2 (High) | **FIXED & VERIFIED** | Static SVG icon missing `<button type="submit">` form trigger wrapper |
| **BUG-003** | Catalog Shop Page | Medium | P2 (High) | **FIXED & VERIFIED** | Missing loading skeleton; premature display of false "No matching products found" |
| **BUG-004** | Admin Product Inventory | Low | P3 (Medium) | **FIXED & VERIFIED** | Missing loading spinner & empty state in inventory table during Neon DB async fetch |
| **BUG-005** | Playwright Test Concurrency | Medium | P2 (High) | **FIXED & VERIFIED** | 4 parallel workers saturated serverless DB pool; reduced to 2 with resilient timeouts |
| **BUG-006** | Checkout Payment Validation | Low | P3 (Medium) | **FIXED & VERIFIED** | Bank transfer session ID mandatory validation not handled in test fixture |
| **BUG-007** | Admin Product & Image Sync | High | P1 (Urgent) | **FIXED & VERIFIED** | Neon UUID type violation, omitted SQL columns, and missing cross-browser SWR sync |
| **BUG-008** | Product Discounted Promo Price | High | P1 (Urgent) | **FIXED & VERIFIED** | Variations defaulted to base price, ignoring product-level promo discount on landing page |
| **BUG-009** | Number & Currency Formatting | Medium | P2 (High) | **FIXED & VERIFIED** | Postgres numeric strings failed `.toLocaleString()`; missing comma thousands separators |
| **BUG-010** | Database & Infrastructure | Critical | P0 (Blocker) | **FIXED & VERIFIED** | Neon free quota exhausted (HTTP 402); migrated to fresh active project `odd-art-25160426` |
| **BUG-011** | Customer Account Governance | High | P1 (Urgent) | **FIXED & VERIFIED** | Missing `is_active` column in Postgres `users` table; account suspension could not persist |
| **BUG-012** | Checkout Payment Selector | Low | P3 (Medium) | **FIXED & VERIFIED** | Missing `value` attributes on payment method radio inputs affecting form accessibility |
| **BUG-013** | Mobile Viewport Navigation | Medium | P2 (High) | **FIXED & VERIFIED** | Missing sticky bottom navigation bar violating PRD §4.1.1 for mobile devices |
| **BUG-014** | Order Placement Data Bridge | High | P1 (Urgent) | **FIXED & VERIFIED** | `createOrderAtomic` matched exclusively by UUID, failing when items had string or slug IDs |
| **BUG-015** | Checkout Delivery State Race | Medium | P2 (High) | **FIXED & VERIFIED** | `locations` initialized as empty array `[]` throwing false "delivery unautomated" before fetch |
| **BUG-016** | Role-Based Access Control (RBAC) | High | P1 (Urgent) | **FIXED & VERIFIED** | Store Inventory Manager had unrestricted Super Admin access; added RBAC sidebar filter and route guards |

---

## 2. In-Depth Bug Profiles & Resolution Documentation

### BUG-001: Cart Removal Modal Text Overlap & Undefined Product Name
- **Affected URL:** `/cart`
- **Component File(s):** 
  - `src/pages/customer/CartPage.jsx`
  - `src/components/common/ConfirmationModal.jsx`
- **Severity:** High
- **Priority:** P1
- **Discovered During:** TC-CART-001 execution (Add to cart -> Click trash icon on iPhone 15 Pro Max)
- **Observed Behavior:**
  - The modal rendered: `Are you sure you want to remove "undefined" from your shopping cart?`
  - For long device titles, the title text overflowed horizontally outside the modal card bounds and overlapped with the close/cancel buttons.
- **Root Cause Analysis:**
  1. In `CartPage.jsx`, the modal prop passed `itemName={itemToDelete?.product_name}`, but the cart state stores the title under `item.name`. Because `item.product_name` was `undefined`, JavaScript rendered literal `"undefined"`.
  2. In `ConfirmationModal.jsx`, the text wrapper container lacked `min-w-0` and `break-words`, and the child container lacked horizontal constraints, preventing long text from wrapping.
- **Resolution Implemented:**
  - Updated `CartPage.jsx` to fallback safely: `itemName={itemToDelete?.name || itemToDelete?.product_name || 'Selected Item'}`.
  - Updated `ConfirmationModal.jsx` with `max-w-lg`, `min-w-0 pr-8`, `break-words`, and proper semantic typography spacing.
- **Verification Evidence:**
  - Playwright test `TC-CART-001` passed. Modal cleanly displays: `Are you sure you want to remove "Apple iPhone 15 Pro Max" from your shopping cart?` with zero layout distortion.

---

### BUG-002: Header Search Icon Not Clickable via Mouse / Touch
- **Affected URL:** Global (`/`, `/shop`, `/product/:slug`, all storefront views)
- **Component File(s):** `src/components/common/Navbar.jsx`
- **Severity:** Medium
- **Priority:** P2
- **Discovered During:** TC-NAV-003 execution
- **Observed Behavior:**
  - Users typing a query into the desktop or mobile search bar could only submit by pressing the physical keyboard `Enter` key.
  - Clicking directly on the magnifying glass icon did nothing because it was an unattached decorative SVG element.
- **Root Cause Analysis:**
  - `<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />` was rendered as a plain SVG rather than being wrapped in a `<button type="submit" aria-label="Search">`.
- **Resolution Implemented:**
  - Wrapped desktop and mobile search icons inside accessible `<button type="submit" aria-label="Submit search" className="...">`.
- **Verification Evidence:**
  - Playwright test `TC-NAV-003` passed. Clicking the search button immediately redirects to `/shop?search=iPhone` with matching results.

---

### BUG-003: Premature "No Matching Products Found" on Catalog Load
- **Affected URL:** `/shop`
- **Component File(s):** `src/pages/public/ShopPage.jsx`
- **Severity:** Medium
- **Priority:** P2
- **Discovered During:** TC-CAT-002, TC-CAT-003, TC-CAT-004 execution
- **Observed Behavior:**
  - When loading `/shop`, the screen instantly flashed "No matching products found" for 1-2 seconds before products popped into view.
  - If a user or automated test interacted immediately, it evaluated the zero-products empty state.
- **Root Cause Analysis:**
  - In `ShopPage.jsx`, `loading` state was tracked with `useState(true)`, but the JSX conditional was simply `{filteredProducts.length === 0 ? <EmptyState /> : <Grid />}` without checking `if (loading)`.
- **Resolution Implemented:**
  - Added modern animated pulse skeleton cards:
    ```jsx
    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
            <div className="bg-slate-200 aspect-square rounded-2xl w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    ) : filteredProducts.length === 0 ? ( ... ) : ( ... )}
    ```
- **Verification Evidence:**
  - Smooth loading transition. Playwright test `TC-CAT-002` and `TC-CAT-004` now distinguish between loading skeletons and verified empty search results.

---

### BUG-004: Missing Async Loading & Empty State on Admin Products Inventory
- **Affected URL:** `/admin/products`
- **Component File(s):** `src/pages/admin/AdminProductsPage.jsx`
- **Severity:** Low
- **Priority:** P3
- **Discovered During:** TC-ADM-002 execution
- **Observed Behavior:**
  - While fetching the products catalog from Neon DB, the table body rendered 0 rows with no loading feedback.
- **Root Cause Analysis:**
  - `AdminProductsPage.jsx` had a `loading` state but did not conditionally render a loading spinner or empty state component inside the table wrapper.
- **Resolution Implemented:**
  - Added a dedicated emerald loading spinner while `loading === true`.
  - Added a clean zero-item empty state with an icon and call to action if no products exist.
- **Verification Evidence:**
  - Playwright test `TC-ADM-002` waits for `tbody tr` visibility and successfully asserts table row counts.

---

### BUG-005: Playwright Parallel Workers Exhausting Database Pool
- **Affected Component:** Test Automation Engine / `playwright.config.js`
- **Severity:** Medium
- **Priority:** P2
- **Discovered During:** Initial full suite execution
- **Observed Behavior:**
  - 4 parallel headless browsers sending simultaneous read/write queries to Neon Postgres caused transient timeouts.
- **Root Cause Analysis:**
  - Concurrency exceeded connection limits for serverless cold-start spikes.
- **Resolution Implemented:**
  - Scaled worker pool to `workers: 2`, increased test action timeout to `60000ms`, expect timeout to `10000ms`, and navigation timeouts to `25000ms`.
- **Verification Evidence:**
  - Reliable test execution across all modules without flaky connection dropouts.

---

### BUG-006: Automated Checkout Blocked by Missing Bank Transfer Session ID
- **Affected Component:** `src/pages/customer/CheckoutPage.jsx` & `e2e/04-cart-checkout.spec.js`
- **Severity:** Low
- **Priority:** P3
- **Discovered During:** TC-CHK-001 execution
- **Observed Behavior:**
  - The checkout test selected the second payment radio button (Direct Bank Transfer) but left the transaction session ID blank. The page correctly triggered validation and stayed on `/checkout`.
- **Root Cause Analysis:**
  - Form validation on line 111 of `CheckoutPage.jsx` mandates:
    `if (paymentMethod === 'bank_transfer' && !bankTransferSessionId.trim()) return setError(...)`
- **Resolution Implemented:**
  - Updated `e2e/04-cart-checkout.spec.js` to select `pay_on_delivery` or dynamically populate a transaction reference `TXN-<timestamp>` when bank transfer is checked.
- **Verification Evidence:**
  - Order is placed cleanly with generated reference matching `UBH-YYYY-NNNNNN` and navigates to `/checkout/success`.

---

### BUG-007: Admin Product Creation and Cross-Browser Image Sync Gap
- **Affected Components:**
  - `src/services/dataService.js`
  - `src/pages/admin/AdminProductFormPage.jsx`
  - `src/pages/admin/AdminProductsPage.jsx`
  - `src/pages/public/HomePage.jsx`
  - `src/pages/public/ShopPage.jsx`
  - `src/components/home/FeaturedProducts.jsx`
- **Severity:** High
- **Priority:** P1 (Urgent)
- **Discovered During:** User reported: *"I noticed on the admin after updating images and creating products, it doesn't reflects on the users end and on the landing page so fix it"*
- **Observed Behavior:**
  - Creating a product or updating product photos in Admin appeared to work locally, but opening the site in a fresh browser (e.g. Edge, Opera, or incognito) failed to show the newly added items or reflected stale placeholder images.
- **Root Cause Analysis:**
  1. **Postgres Type Violation:** The `category_id` column in Neon Lakebase Postgres is of type `UUID`. The admin form provided legacy string IDs (e.g., `'cat-1'`), which threw `invalid input syntax for type uuid: "cat-1"`. The SQL query rejected the insert and silently fell back to browser `localStorage` only.
  2. **Incomplete Column Set in SQL:** The SQL `INSERT` and `UPDATE` statements in `dataService.js` lacked `category_id`, `brand_id`, `images`, and `specifications` columns, omitting image arrays from database rows.
  3. **No Direct Image URL Entry:** The form only allowed uploading local files as base64 strings rather than web URLs, creating large storage payloads that did not distribute smoothly across devices.
  4. **Landing Page Category & Product Filtering:** `FeaturedProducts.jsx` only matched legacy category IDs and strictly showed featured products; new additions were excluded from the landing grid.
  5. **Cross-Browser Hydration:** Fresh browser contexts loaded an empty state without SWR cache revalidation, causing loading hangs.
- **Resolution Implemented:**
  1. **UUID Resolution:** Added robust category and brand UUID resolvers in `dataService.js` `saveProduct()` to convert legacy IDs (`'cat-1'`, `'iphones'`) into genuine Neon database UUIDs before executing SQL.
  2. **Complete SQL Upserts:** Included `category_id`, `brand_id`, `images`, and `specifications` in both `INSERT` and `UPDATE` queries with `ON CONFLICT (slug) DO UPDATE`.
  3. **URL Input Field:** Added a dedicated Image URL input and "Add Image URL" button to `AdminProductFormPage.jsx`.
  4. **Landing Page Grid Enhancement:** Updated `FeaturedProducts.jsx` and `HomePage.jsx` to render up to 16 active products (featured items followed by new arrivals) and matched category slugs and UUIDs dynamically.
  5. **SWR Cache Synchronization:** Initialized state in `ShopPage.jsx`, `HomePage.jsx`, and `AdminProductsPage.jsx` from `localStorage` while seamlessly revalidating from Neon in the background.
- **Verification Evidence:**
  - Automated tests in `e2e/07-admin-storefront-sync.spec.js`:
    - `TC-SYNC-001` (Admin creates product -> Reflected in separate client session) **PASSED**.
    - `TC-SYNC-002` (Admin updates image -> Reflected on detail page in separate client session) **PASSED**.
    - `TC-SYNC-003` (Category image update in admin -> Reflected on landing cards) **PASSED**.

---

### BUG-008: Discounted Promo Price Ignored on Landing Page When Variations Configured
- **Affected URL:** `/`, `/shop`, `/product/:slug`
- **Component File(s):**
  - `src/components/common/ProductCard.jsx`
  - `src/components/common/QuickViewModal.jsx`
  - `src/pages/public/ProductDetailPage.jsx`
  - `src/context/CartContext.jsx`
  - `src/services/dataService.js`
  - `src/pages/admin/AdminProductFormPage.jsx`
- **Severity:** High
- **Priority:** P1
- **Observed Behavior:**
  - After entering a Base Price (e.g. ₦1,650,000) and a Discounted Price (e.g. ₦1,580,000) in Admin, the product card on the Landing Page displayed the base price (₦1,650,000) as the main active price, with no strikethrough or promo badge.
- **Root Cause Analysis:**
  1. In `ProductCard.jsx`, `currentPrice` checked `defaultVariation ? defaultVariation.discounted_price || defaultVariation.price : product.discounted_price || product.base_price`. When variations existed with unconfigured or null `discounted_price`, the variation's base `price` took precedence, completely bypassing `product.discounted_price`.
  2. `AdminProductFormPage.jsx` did not propagate the product-level discount to variation records upon submission.
- **Resolution Implemented:**
  - Implemented hierarchical discount resolution in `ProductCard`, `QuickViewModal`, `ProductDetailPage`, and `CartContext`: check variation discount first; if absent, inherit the product-level discount.
  - Automatically synchronized product-level discounts to variations in `dataService.js` and `AdminProductFormPage.jsx`.
- **Verification Evidence:**
  - Playwright test `TC-PROD-005` and `TC-SYNC-001` passed. The Landing Page displays `₦1,580,000` as the active bold price, `₦1,650,000` struck through, and a `Save ₦70,000` badge.

---

### BUG-009: Missing Comma Thousands Separators in Figures and Currency Values
- **Affected URL:** Global (Storefront, Admin, Cart, Checkout, Orders, Customers, Delivery)
- **Component File(s):**
  - `src/utils/formatters.js`
  - `src/components/common/ProductCard.jsx`
  - `src/components/common/QuickViewModal.jsx`
  - `src/pages/public/ProductDetailPage.jsx`
  - `src/pages/customer/CartPage.jsx`
  - `src/pages/customer/CheckoutPage.jsx`
  - `src/pages/admin/AdminProductsPage.jsx`
  - `src/pages/admin/AdminOrdersPage.jsx`
  - `src/pages/admin/AdminDashboardPage.jsx`
  - `src/pages/admin/AdminReportsPage.jsx`
  - `src/pages/admin/AdminCustomersPage.jsx`
  - `src/services/dataService.js`
- **Severity:** Medium
- **Priority:** P2
- **Observed Behavior:**
  - Numbers and figures throughout the application were rendered as raw digits (e.g., `₦1650000.00` or `1500000`) without comma separators.
- **Root Cause Analysis:**
  - Numeric columns from Neon Lakebase Postgres (e.g. `base_price`, `discounted_price`, `total_amount`) are returned as strings (e.g. `"1650000.00"`). JavaScript's `String.prototype.toLocaleString()` returns the string verbatim without formatting it as a number.
- **Resolution Implemented:**
  - Created standardized `formatPrice(amount)` and `formatNumber(val)` in `src/utils/formatters.js` that coerce strings to numbers, strip extraneous decimal points, and format using the Nigerian locale (`en-NG`) with thousands comma separators.
  - Replaced all raw `.toLocaleString()` calls with `formatPrice` and `formatNumber`.
  - Normalized all variation prices and quantities to genuine numbers in `dataService.js`.
- **Verification Evidence:**
  - Playwright test `TC-PROD-005` asserts regex pattern `/₦\d{1,3}(,\d{3})+/` across landing cards, PDP, cart, and admin tables. All figures render cleanly with commas (e.g., `₦1,650,000`, `₦1,580,000`, `Save ₦70,000`).

---

### BUG-010: Remote Neon PostgreSQL Quota Exhaustion (HTTP 402) & Stale Fallback Cluster
- **Affected URL:** Global / Backend API
- **Component File(s):** `.env`, `src/services/neonClient.js`, `neon/schema.sql`
- **Severity:** Critical (Blocker)
- **Priority:** P0
- **Observed Behavior:**
  - Database queries failed with: `NeonDbError: Server error (HTTP status 402): {"message":"Your account or project has exceeded the quota."}`.
  - Hardcoded connection fallback in `neonClient.js` pointed to an expired test cluster.
- **Root Cause Analysis:**
  - The previous Neon project `little-band-17620142` reached its monthly compute quota.
  - Fallback environment string in `neonClient.js` was hardcoded to the deprecated endpoint when running without Vite env variables.
- **Resolution Implemented:**
  - Provisioned a fresh Neon project `odd-art-25160426` (`uban-harkalla-v2`) in `aws-us-west-2`.
  - Updated `.env` with pooled and unpooled URIs.
  - Updated `neonClient.js` to prioritize `process.env.DATABASE_URL` and `import.meta.env.VITE_NEON_DATABASE_URL` dynamically.
  - Ran full schema migration and database seeding (`scripts/migrate-neon.mjs` and `scripts/seed-admin-neon.mjs`).
- **Verification Evidence:**
  - Playwright suite executed 43 tests against active Neon PostgreSQL with zero connection or quota failures.

---

### BUG-011: Missing `is_active` Column in PostgreSQL `users` Table for Account Suspension
- **Affected URL:** `/admin/customers`, `/login`
- **Component File(s):** `neon/schema.sql`, `scripts/seed-admin-neon.mjs`, `src/context/AuthContext.jsx`
- **Severity:** High
- **Priority:** P1
- **Observed Behavior:**
  - In Admin Customers directory, toggling customer status or logging in as a suspended customer threw `column "is_active" of relation "users" does not exist`.
- **Root Cause Analysis:**
  - The `users` table schema omitted the boolean flag `is_active` required for customer account governance according to PRD Section 4.5.
- **Resolution Implemented:**
  - Added `is_active BOOLEAN NOT NULL DEFAULT true` to `neon/schema.sql`.
  - Executed migration altering table `users` on active Neon database.
  - Added seed test users: `abubakar@test.ng` (`is_active: true`), `chidi@test.ng` (`is_active: true`), and `suspended@test.ng` (`is_active: false`).
  - Added auth guard blocking login when `user.is_active === false` with clear customer support message.
- **Verification Evidence:**
  - Playwright tests `TC-E2E-008` and `TC-E2E-009` passed. Admin can toggle user active state, and suspended accounts are rejected with appropriate error notice.

---

### BUG-012: Missing `value` Attributes on Checkout Payment Method Radio Inputs
- **Affected URL:** `/checkout`
- **Component File(s):** `src/pages/customer/CheckoutPage.jsx`
- **Severity:** Low
- **Priority:** P3
- **Observed Behavior:**
  - Screen readers and automated tests clicking payment options required brittle text matching because the radio `<input type="radio">` tags lacked standard HTML `value` attributes.
- **Root Cause Analysis:**
  - `<input type="radio" checked={paymentMethod === '...'} onChange={...} />` omitted explicit `value="paystack"`, `value="bank_transfer"`, and `value="pay_on_delivery"`.
- **Resolution Implemented:**
  - Explicitly added `value="paystack"`, `value="bank_transfer"`, and `value="pay_on_delivery"` to all payment option inputs.
- **Verification Evidence:**
  - Form controls adhere to W3C accessible form specifications. Automated tests select payment methods directly by radio value or accessible label.

---

### BUG-013: Missing Sticky Mobile Bottom Navigation Bar
- **Affected URL:** Storefront on mobile viewport (< 768px)
- **Component File(s):** `src/components/common/Navbar.jsx`
- **Severity:** Medium
- **Priority:** P2
- **Observed Behavior:**
  - On mobile devices and small viewports (e.g. 375px), navigating between Home, Shop, Cart, and Account required opening the top hamburger menu.
  - Violated PRD §4.1.1 specification: *"Mobile Bottom Navigation: Sticky bottom bar on small viewports with quick links to Home, Shop, Cart (with badge), and Account."*
- **Root Cause Analysis:**
  - Only the top header navbar and mobile slide-out drawer had been built; the sticky bottom bar was absent.
- **Resolution Implemented:**
  - Implemented sticky bottom navigation bar in `src/components/common/Navbar.jsx`:
    ```jsx
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
      <NavLink to="/" ...>Home</NavLink>
      <NavLink to="/shop" ...>Shop</NavLink>
      <NavLink to="/cart" ...>Cart (with dynamic badge)</NavLink>
      <NavLink to={user ? "/dashboard" : "/login"} ...>Account</NavLink>
    </nav>
    ```
- **Verification Evidence:**
  - Playwright test `TC-E2E-015` passed on 375px viewport. Bottom navigation bar is visible, sticky, and provides direct one-tap access with active route indicators and live cart badge.

---

### BUG-014: Checkout Order Placement Failure on Product ID Format Mismatch
- **Affected URL:** `/checkout`
- **Component File(s):** `src/services/dataService.js`
- **Severity:** High
- **Priority:** P1
- **Observed Behavior:**
  - During checkout submission, orders intermittently failed with: `Product "Apple iPhone 15 Pro Max" is no longer available.`
- **Root Cause Analysis:**
  - `createOrderAtomic` validated items using strictly `products.find((p) => p.id === item.product_id)`.
  - When products were fetched from Neon PostgreSQL (UUID format `00000000-...`), but local storage state or fallback cart items retained string/slug formats (`prod-1`, `apple-iphone-15-pro-max`), the ID equality check failed.
- **Resolution Implemented:**
  - Enhanced item and stock matching in `dataService.js`:
    ```javascript
    const prod = products.find(
      (p) => p.id === item.product_id || p.name === item.product_name || (item.slug && p.slug === item.slug)
    );
    ```
  - Similarly enhanced variation matching by `v.id === item.variation_id || v.sku === item.sku`.
- **Verification Evidence:**
  - Playwright test `TC-E2E-004` passed. Checkout succeeds seamlessly across database-backed and client-backed product references.

---

### BUG-015: Delivery Location Availability False Negative on Initial Async Render
- **Affected URL:** `/checkout`
- **Component File(s):** `src/pages/customer/CheckoutPage.jsx`
- **Severity:** Medium
- **Priority:** P2
- **Observed Behavior:**
  - Fast order submissions or automated test runs for nationwide orders (e.g. Abuja) occasionally threw: `Delivery is not currently automated for "Abuja (FCT)". Please contact support via WhatsApp to arrange specialized delivery.`
- **Root Cause Analysis:**
  - In `CheckoutPage.jsx`, `locations` was initialized to empty array `[]` (`useState([])`).
  - If a user or automated test submitted the form while `getDeliveryLocations()` was still resolving over network, `locations.find(...)` returned `undefined`, triggering the fallback unautomated error.
- **Resolution Implemented:**
  - Initialized `locations` with `INITIAL_DELIVERY_LOCATIONS` from `initialData.js` so default coverage states (Kano, Niger, Abuja, Katsina, Kaduna) are immediately present before network resolution.
  - Added fallback `effectiveLocations = locations?.length > 0 ? locations : INITIAL_DELIVERY_LOCATIONS` in the submission validation block.
- **Verification Evidence:**
  - Playwright test `TC-E2E-002` passed on the first run with zero flakiness.

---

### BUG-016: Store Inventory Manager Role Had Full Unrestricted Super Admin Access
- **Affected URL:** `/admin/*` (`/admin/users`, `/admin/payments`, `/admin/reports`, `/admin/settings`, `/admin/content`, etc.)
- **Component File(s):**
  - `src/components/admin/AdminLayout.jsx`
  - `src/components/admin/AdminRoute.jsx`
  - `src/App.jsx`
- **Severity:** High
- **Priority:** P1
- **Observed Behavior:**
  - When logged in as Store Inventory Manager (`inventory@ubanharkalla.com` with role `admin`), all 13 sidebar links and administration modules were visible and accessible, including Staff & Roles management, corporate Bank & Paystack credentials, Financial Reports, and System Settings.
- **Root Cause Analysis:**
  - `AdminLayout.jsx` rendered all 13 navigation links indiscriminately for any user with `role === 'admin'` or `role === 'super_admin'`.
  - Sub-routes in `App.jsx` did not enforce granular Role-Based Access Control (RBAC), allowing any authenticated staff user to modify staff accounts, financial accounts, and global settings.
- **Resolution Implemented:**
  1. Updated `AdminLayout.jsx` with `superAdminOnly: true` flags on restricted modules:
     - Only Super Admins (`role: 'super_admin'`) see: Staff & Roles (`/admin/users`), Payments & Banks (`/admin/payments`), Financial Reports (`/admin/reports`), General Settings (`/admin/settings`), Website Content (`/admin/content`), Delivery Locations (`/admin/delivery`), and Customers Directory (`/admin/customers`).
     - Store Inventory Managers (`role: 'admin'`) see: Overview, Products & Variations, Categories, Brands, Customer Orders, and Testimonials.
  2. Updated `AdminRoute.jsx` with a `requireSuperAdmin` prop. If an inventory manager navigates directly to a Super Admin route, a clean branded "Access Restricted — Super Admin Privileges Required" barrier is displayed with a return CTA.
  3. Wrapped all sensitive sub-routes in `App.jsx` with `<AdminRoute requireSuperAdmin>`.
  4. Displayed distinct role badges in the header and sidebar ("Super Administrator" vs "Store Inventory Manager").
- **Verification Evidence:**
  - Playwright test `TC-ADM-008` in `e2e/06-admin-lifecycle.spec.js` passed. Verified that Store Inventory Manager only sees permitted modules, restricted links are omitted, and direct URL navigation to `/admin/users` and `/admin/payments` triggers the Access Restricted barrier.

---

## 3. Bug Classification Matrix by Severity

| Severity Level | Count | Fixed | Verified |
|---|---|---|---|
| **Critical / Blocker** | 1 | 1 | 1 |
| **High / Major** | 7 | 7 | 7 |
| **Medium** | 6 | 6 | 6 |
| **Low / Minor** | 2 | 2 | 2 |
| **Total Bugs** | **16** | **16** | **16** |

**Bug Resolution Rate:** **100.0%**
