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

## 3. Bug Classification Matrix by Severity

| Severity Level | Count | Fixed | Verified |
|---|---|---|---|
| **Critical / Blocker** | 0 | 0 | 0 |
| **High / Major** | 1 | 1 | 1 |
| **Medium** | 3 | 3 | 3 |
| **Low / Minor** | 2 | 2 | 2 |
| **Total Bugs** | **6** | **6** | **6** |

**Bug Resolution Rate:** **100.0%**
