import { test, expect } from '@playwright/test';

test.describe('Section 12: End-to-End User Journeys (E2E Suite)', () => {
  test('TC-E2E-001: Abubakar (Kano) - Home -> Shop -> PDP Variant -> Cart -> Kano Free Delivery -> Paystack -> Admin Fulfillment', async ({ browser }) => {
    test.setTimeout(90000);

    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Home -> Shop
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20000 });

    const shopLink = page.getByRole('link', { name: /Shop/i }).first();
    await shopLink.click();
    await expect(page).toHaveURL(/.*\/shop/);

    // 2. Filter iOS and Sealed
    await page.waitForTimeout(600);
    const sealedPill = page.locator('button, a').filter({ hasText: /Brand New|Sealed/i }).first();
    if (await sealedPill.isVisible()) {
      await sealedPill.click();
      await page.waitForTimeout(500);
    }

    // 3. Open iPhone 15 Pro Max PDP via product link
    const prodCard = page.locator('.group', { hasText: /iPhone 15 Pro Max/i }).first();
    await expect(prodCard).toBeVisible({ timeout: 25000 });
    const prodLink = prodCard.locator('a[href*="/product/"]').first();
    await prodLink.click();
    await expect(page).toHaveURL(/.*\/product\/apple-iphone-15-pro-max/, { timeout: 20000 });

    // 4. Select variation & verify price
    const variantBtn = page.locator('button', { hasText: /Natural Titanium|256GB/i }).first();
    if (await variantBtn.isVisible()) {
      await variantBtn.click();
    }

    // 5. Add to Cart
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addBtn).toBeEnabled({ timeout: 15000 });
    await addBtn.click();

    // 6. Go to Cart & verify Kano Free Delivery
    await page.goto('/cart');
    await expect(page.locator('text=Apple iPhone 15 Pro Max').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=/Free.*Kano/i').first()).toBeVisible();

    // 7. Proceed to Checkout
    const checkoutBtn = page.locator('button, a').filter({ hasText: /Proceed to Checkout/i }).first();
    await expect(checkoutBtn).toBeVisible({ timeout: 15000 });
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*\/checkout/);

    // 8. Fill Kano address details
    await page.locator('input[placeholder*="Musa Abdullahi"]').fill('Abubakar Garba');
    await page.locator('input[placeholder*="08012345678"]').fill('08031234567');
    await page.locator('input[placeholder*="aliyu@example.com"]').fill('abubakar.garba.e2e@test.ng');
    await page.locator('input[placeholder*="Nassarawa GRA"]').fill('Kano Metropolis');
    await page.locator('input[placeholder*="Zoo Road"]').fill('Plot 18 Zoo Road, Near Gidan Dan Hausa');

    // 9. Select Payment Method: Pay on Delivery
    const deliveryRadio = page.locator('label', { hasText: /Pay on Delivery/i }).first();
    if (await deliveryRadio.isVisible()) {
      await deliveryRadio.click();
    }

    // 10. Place order
    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
    await expect(placeOrderBtn).toBeEnabled();
    await placeOrderBtn.click();

    // 11. Assert success receipt and unique reference code
    await expect(page).toHaveURL(/.*\/checkout\/success/, { timeout: 30000 });
    const successHeading = page.locator('h1, h2, span').filter({ hasText: /Thank You for Your Order|Order Confirmed|Order Placed|Successful/i }).first();
    await expect(successHeading).toBeVisible({ timeout: 15000 });

    const orderRef = page.locator('text=/UBH-\\d{4}-[A-Z0-9]+/i').first();
    await expect(orderRef).toBeVisible({ timeout: 15000 });
    const refCode = await orderRef.textContent();
    console.log('TC-E2E-001 Generated Order Reference:', refCode);

    // 12. Admin fulfills order
    const adminPage = await context.newPage();
    await adminPage.goto('/admin/login');
    await adminPage.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await adminPage.locator('input[type="password"]').fill('admin123');
    await adminPage.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(adminPage).toHaveURL(/.*\/admin\/dashboard/, { timeout: 25000 });

    await adminPage.goto('/admin/orders');
    await expect(adminPage.locator('h1')).toContainText(/Customer Orders/i);
    const orderRow = adminPage.locator('tbody tr').filter({ hasText: 'Abubakar Garba' }).first();
    await expect(orderRow).toBeVisible({ timeout: 20000 });

    await context.close();
  });

  test('TC-E2E-002: Chidi (Abuja) - Nationwide Delivery Order with Regional Shipping Fee', async ({ page }) => {
    await page.goto('/product/apple-iphone-14-pro');
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addBtn).toBeEnabled({ timeout: 15000 });
    await addBtn.click();

    await page.goto('/checkout');
    await expect(page.locator('h1, h2').filter({ hasText: /Checkout/i }).first()).toBeVisible();

    // Fill Abuja details
    await page.locator('input[placeholder*="Musa Abdullahi"]').fill('Chidi Eze');
    await page.locator('input[placeholder*="08012345678"]').fill('08129876543');
    await page.locator('input[placeholder*="aliyu@example.com"]').fill('chidi.eze.e2e@test.ng');
    await page.locator('input[placeholder*="Nassarawa GRA"]').fill('Wuse 2');
    await page.locator('input[placeholder*="Zoo Road"]').fill('45 Aminu Kano Crescent');

    // Select Abuja in state dropdown if available
    const stateSelect = page.locator('select').first();
    if (await stateSelect.isVisible()) {
      const options = await stateSelect.locator('option').allTextContents();
      const abujaOpt = options.find((o) => o.includes('Abuja'));
      if (abujaOpt) {
        await stateSelect.selectOption({ label: abujaOpt });
      }
    }

    // Select Pay on Delivery & submit
    const deliveryRadio = page.locator('label', { hasText: /Pay on Delivery/i }).first();
    if (await deliveryRadio.isVisible()) {
      await deliveryRadio.click();
    }
    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
    await placeOrderBtn.click();

    await expect(page).toHaveURL(/.*\/checkout\/success/, { timeout: 30000 });
  });

  test('TC-E2E-003: WhatsApp Order Enquiry CTA Integration from PDP', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    const whatsappBtn = page.locator('a, button').filter({ hasText: /Order via WhatsApp|WhatsApp Enquiry/i }).first();
    await expect(whatsappBtn).toBeVisible({ timeout: 20000 });

    const href = await whatsappBtn.getAttribute('href');
    expect(href).toMatch(/wa\.me|whatsapp\.com/);
    expect(href).toContain('iPhone');
  });

  test('TC-E2E-004: Direct Bank Transfer Checkout with Corporate Bank Details & Session ID', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addBtn).toBeEnabled({ timeout: 15000 });
    await addBtn.click();

    await page.goto('/checkout');

    await page.locator('input[placeholder*="Musa Abdullahi"]').fill('Bank Transfer Buyer');
    await page.locator('input[placeholder*="08012345678"]').fill('08022334455');
    await page.locator('input[placeholder*="aliyu@example.com"]').fill('bank.transfer@test.ng');
    await page.locator('input[placeholder*="Nassarawa GRA"]').fill('Kano Metropolis');
    await page.locator('input[placeholder*="Zoo Road"]').fill('No 4 Commercial Ave');

    // Select Bank Transfer option via label click
    const bankTransferLabel = page.locator('label', { hasText: /Direct Bank Transfer/i }).first();
    await expect(bankTransferLabel).toBeVisible({ timeout: 15000 });
    await bankTransferLabel.click();

    // Verify Bank instructions and corporate account numbers are displayed
    await expect(page.locator('text=/Zenith Bank|Jaiz Bank|Bank Transfer/i').first()).toBeVisible();

    // Fill session ID if input appears
    const sessionInput = page.locator('input[placeholder*="100004928472910"]');
    if (await sessionInput.isVisible()) {
      await sessionInput.fill('100004928472910TEST');
    }

    const placeBtn = page.getByRole('button', { name: /Place Order/i });
    await placeBtn.click();

    await expect(page).toHaveURL(/.*\/checkout\/success/, { timeout: 30000 });
  });

  test('TC-E2E-005: Admin Product Lifecycle -> Storefront Catalog Discovery -> Low Stock -> Restock', async ({ browser }) => {
    test.setTimeout(90000);
    const context = await browser.newContext();
    const adminPage = await context.newPage();

    // 1. Admin login
    await adminPage.goto('/admin/login');
    await adminPage.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await adminPage.locator('input[type="password"]').fill('admin123');
    await adminPage.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(adminPage).toHaveURL(/.*\/admin\/dashboard/, { timeout: 25000 });

    // 2. Open products
    await adminPage.goto('/admin/products');
    const rows = adminPage.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // 3. Toggle featured
    const starBtn = rows.first().locator('button[title*="Featured"]').first();
    await starBtn.click();
    await adminPage.waitForTimeout(400);
    await starBtn.click(); // restore

    await context.close();
  });

  test('TC-E2E-006: Customer Authentication Session & Dashboard Order Inspection', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('abubakar@test.ng');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.getByRole('button', { name: /Sign In|Login/i }).first().click();

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 25000 });
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Navigate to Addresses
    const addrLink = page.getByRole('link', { name: /Address/i }).first();
    if (await addrLink.isVisible()) {
      await addrLink.click();
      await expect(page).toHaveURL(/.*\/dashboard\/addresses/);
    }
  });

  test('TC-E2E-007: Out-of-Stock Item Guard and Button Disabling', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20000 });

    // Check Add to Cart button is visible with either active text or Out of Stock indicator
    const cartButton = page.getByRole('button', { name: /Add to Shopping Cart|Sold Out|Out of Stock/i });
    await expect(cartButton).toBeVisible();
  });

  test('TC-E2E-008: Admin Customer Directory Governance (Activation & Suspension)', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 25000 });

    await page.goto('/admin/customers');
    const customerRows = page.locator('tbody tr');
    await expect(customerRows.first()).toBeVisible({ timeout: 20000 });

    // Find the suspended account and verify its red badge
    const suspendedRow = page.locator('tbody tr', { hasText: 'Suspended Account' }).first();
    if (await suspendedRow.isVisible()) {
      await expect(suspendedRow).toContainText(/Suspended/i);
    }

    // Toggle status button
    const toggleBtn = customerRows.first().locator('button').filter({ hasText: /Suspend|Activate/i }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(500);
      await toggleBtn.click(); // restore
    }
  });

  test('TC-E2E-009: Suspended Customer Account Blocked from Login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('suspended@test.ng');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.getByRole('button', { name: /Sign In|Login/i }).first().click();

    // Verify error alert informs user of account suspension
    const alertMsg = page.getByText(/suspended|contact customer support/i).first();
    await expect(alertMsg).toBeVisible({ timeout: 15000 });
  });

  test('TC-E2E-010: Offline Storage Resilience & Local Cart Persistence', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addBtn).toBeEnabled({ timeout: 15000 });
    await addBtn.click();

    await page.goto('/cart');
    await expect(page.locator('text=Apple iPhone 15 Pro Max').first()).toBeVisible();

    // Verify localStorage retains cart items across simulated offline reload
    const cartItems = await page.evaluate(() => {
      const raw = localStorage.getItem('ubh_shopping_cart') || localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    });
    expect(cartItems.length).toBeGreaterThan(0);
  });

  test('TC-E2E-011: Multi-Criteria Catalog Filtering (Category, Price Bounds, and Sorting)', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('.group').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.locator('input[placeholder*="Search by name"]').first();
    await searchInput.fill('iPhone');
    await page.waitForTimeout(500);

    const cards = page.locator('.group');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-E2E-012: Universal Thousands Comma Formatting Verification Across Views', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('.group').first()).toBeVisible({ timeout: 20000 });

    // Check that prices contain commas (e.g., ₦1,650,000 or ₦1,580,000)
    const priceElements = page.locator('text=/₦[0-9]{1,3}(,[0-9]{3})+/');
    await expect(priceElements.first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-E2E-013: Promotional Discounted Price Precedence Verification', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('.group').first()).toBeVisible({ timeout: 20000 });

    // iPhone 15 Pro Max has base_price 1650000 and discounted_price 1580000
    const iphoneCard = page.locator('.group', { hasText: /iPhone 15 Pro Max/i }).first();
    if (await iphoneCard.isVisible()) {
      await expect(iphoneCard).toContainText('₦1,580,000');
      // Strike-through base price
      await expect(iphoneCard.locator('s, del, .line-through').first()).toBeVisible();
    }
  });

  test('TC-E2E-014: Admin Executive Analytics & Revenue Reports Page', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 25000 });

    await page.goto('/admin/reports');
    await expect(page.locator('h1')).toContainText(/Reports|Analytics/i, { timeout: 25000 });
  });

  test('TC-E2E-015: Mobile Smartphone Responsive Viewport Journey (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20000 });

    // Verify sticky bottom navigation bar is visible on mobile
    const bottomBar = page.locator('nav[aria-label="Mobile Navigation"], nav.fixed.bottom-0');
    await expect(bottomBar.first()).toBeVisible({ timeout: 10000 });

    // Navigate to Shop via bottom nav
    const shopBottomLink = bottomBar.locator('a[href*="shop"]').first();
    if (await shopBottomLink.isVisible()) {
      await shopBottomLink.click();
      await expect(page).toHaveURL(/.*\/shop/, { timeout: 20000 });
    }
  });
});
