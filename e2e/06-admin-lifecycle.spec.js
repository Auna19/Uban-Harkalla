import { test, expect } from '@playwright/test';

test.describe('Module 6: Admin Management & Fulfillment Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin
    await page.goto('/admin/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill('admin@ubanharkalla.com');
    await passwordInput.fill('admin123');

    const submitBtn = page.getByRole('button', { name: /Access Dashboard|Login/i });
    await submitBtn.click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 25000 });
  });

  test('TC-ADM-001: Admin Dashboard loads metrics cards', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
    // Key metric cards (Revenue, Orders, Products, Customers)
    const metricsCards = page.locator('.rounded-3xl, .rounded-2xl').filter({ hasText: /Revenue|Orders|Products|Customers/i });
    expect(await metricsCards.count()).toBeGreaterThan(0);
  });

  test('TC-ADM-002: Admin Products Page loads inventory table', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page.locator('h1')).toContainText(/Product Inventory/i);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify Star Featured button
    const featuredBtn = rows.first().locator('button[title*="Featured"]');
    await expect(featuredBtn).toBeVisible();
    await featuredBtn.click();
    await page.waitForTimeout(400);
    // Click again to restore
    await featuredBtn.click();
  });

  test('TC-ADM-003: Admin Orders Page loads customer orders', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page.locator('h1')).toContainText(/Customer Orders/i);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('TC-ADM-004: Admin Customer Directory lists customers', async ({ page }) => {
    await page.goto('/admin/customers');
    await expect(page.locator('h1')).toContainText(/Customer/i);

    // Wait for customer rows to be loaded from database
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('TC-ADM-005: Admin Products Page supports multiple selection checkboxes and bulk action controls', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page.locator('h1')).toContainText(/Product Inventory/i);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);

    // 1. Select the first two product checkboxes
    const firstCheckbox = rows.nth(0).locator('input[type="checkbox"]');
    const secondCheckbox = rows.nth(1).locator('input[type="checkbox"]');
    await firstCheckbox.check();
    await secondCheckbox.check();

    // Verify bulk action banner appears with correct count
    const bulkBanner = page.locator('text=/2 products selected/i');
    await expect(bulkBanner).toBeVisible();

    const deleteBtn = page.getByRole('button', { name: /Delete Selected \(2\)/i });
    await expect(deleteBtn).toBeVisible();

    // 2. Test Clear Selection
    const clearBtn = page.getByRole('button', { name: /Clear Selection/i });
    await clearBtn.click();
    await expect(bulkBanner).not.toBeVisible();
    expect(await firstCheckbox.isChecked()).toBe(false);
    expect(await secondCheckbox.isChecked()).toBe(false);

    // 3. Test Select All in Header
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
    await selectAllCheckbox.check();
    const selectAllBanner = page.locator('text=/\\d+ products selected/i');
    await expect(selectAllBanner).toBeVisible();

    // Deselect all
    await selectAllCheckbox.uncheck();
    await expect(selectAllBanner).not.toBeVisible();

    // 4. Test Bulk Delete Confirmation Modal
    await firstCheckbox.check();
    await secondCheckbox.check();
    await deleteBtn.click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Delete 2 Products from Store\?/i);

    // Click Cancel to dismiss safely without modifying base inventory
    const cancelBtn = modal.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('TC-ADM-006: Admin Customer Directory supports multiple selection checkboxes and bulk action controls', async ({ page }) => {
    await page.goto('/admin/customers');
    await expect(page.locator('h1')).toContainText(/Customer/i);

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1);

    // 1. Select the first two customer checkboxes
    const firstCheckbox = rows.nth(0).locator('input[type="checkbox"]');
    const secondCheckbox = rows.nth(1).locator('input[type="checkbox"]');
    await firstCheckbox.check();
    await secondCheckbox.check();

    // Verify bulk action banner appears with correct count
    const bulkBanner = page.locator('text=/2 customers selected/i');
    await expect(bulkBanner).toBeVisible();

    const deleteBtn = page.getByRole('button', { name: /Delete Selected \(2\)/i });
    await expect(deleteBtn).toBeVisible();

    // 2. Test Clear Selection
    const clearBtn = page.getByRole('button', { name: /Clear Selection/i });
    await clearBtn.click();
    await expect(bulkBanner).not.toBeVisible();
    expect(await firstCheckbox.isChecked()).toBe(false);
    expect(await secondCheckbox.isChecked()).toBe(false);

    // 3. Test Select All in Header
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
    await selectAllCheckbox.check();
    const selectAllBanner = page.locator(`text=/${rowCount} customers selected/i`);
    await expect(selectAllBanner).toBeVisible();

    // Deselect all
    await selectAllCheckbox.uncheck();
    await expect(selectAllBanner).not.toBeVisible();

    // 4. Test Bulk Delete Confirmation Modal
    await firstCheckbox.check();
    await secondCheckbox.check();
    await deleteBtn.click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Delete 2 Customers/i);

    // Click Cancel to dismiss safely
    const cancelBtn = modal.getByRole('button', { name: /Cancel/i });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('TC-ADM-007: Admin Product Form variation addition and removal displays notification toasts', async ({ page }) => {
    await page.goto('/admin/products/create');
    await expect(page.locator('h1')).toContainText(/Create New Product/i, { timeout: 25000 });

    // Scroll to Dynamic Variations Builder section
    const variationsHeader = page.getByRole('heading', { name: /3\. Dynamic Variations Builder/i });
    await variationsHeader.scrollIntoViewIfNeeded();
    await expect(variationsHeader).toBeVisible();

    // 1. Add Variation
    const addVarBtn = page.getByRole('button', { name: /Add Variation|\+ Add First Variation/i }).first();
    await addVarBtn.click();

    // Verify addition toast appears
    const addToast = page.locator('text=/New variation added!/i');
    await expect(addToast).toBeVisible({ timeout: 10000 });

    // 2. Click Remove button on the created variation
    const removeBtn = page.getByRole('button', { name: /Remove/i }).first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Verify ConfirmationModal opens
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Remove Product Variation\?/i);

    // Confirm Removal
    const confirmRemoveBtn = modal.getByRole('button', { name: /Remove Variation/i });
    await confirmRemoveBtn.click();

    // 3. Verify Removal Notification Toast displays
    const removeToast = page.locator('text=/Variation .* removed\./i');
    await expect(removeToast).toBeVisible({ timeout: 10000 });
  });

  test('TC-ADM-008: Store Inventory Manager role permissions and Super Admin route restriction barrier', async ({ browser }) => {
    const context = await browser.newContext();
    const invPage = await context.newPage();

    // 1. Log in as Store Inventory Manager
    await invPage.goto('/admin/login');
    await invPage.locator('input[type="email"]').fill('inventory@ubanharkalla.com');
    await invPage.locator('input[type="password"]').fill('admin123');
    await invPage.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(invPage).toHaveURL(/.*\/admin\/dashboard/, { timeout: 25000 });

    // 2. Check sidebar shows Store Inventory Manager role badge
    await expect(invPage.locator('text=Store Inventory Manager').first()).toBeVisible();

    // 3. Verify permitted sections are visible in sidebar
    await expect(invPage.locator('a[href="/admin/products"]').first()).toBeVisible();
    await expect(invPage.locator('a[href="/admin/categories"]').first()).toBeVisible();
    await expect(invPage.locator('a[href="/admin/brands"]').first()).toBeVisible();
    await expect(invPage.locator('a[href="/admin/orders"]').first()).toBeVisible();

    // 4. Verify restricted super admin sections are NOT in sidebar
    await expect(invPage.locator('a[href="/admin/users"]')).toHaveCount(0);
    await expect(invPage.locator('a[href="/admin/payments"]')).toHaveCount(0);
    await expect(invPage.locator('a[href="/admin/reports"]')).toHaveCount(0);
    await expect(invPage.locator('a[href="/admin/settings"]')).toHaveCount(0);

    // 5. Navigate directly to a restricted URL (/admin/users) -> Verify Access Restricted barrier
    await invPage.goto('/admin/users');
    await expect(invPage.locator('text=Super Admin Privileges Required')).toBeVisible({ timeout: 15000 });
    await expect(invPage.locator('text=Access Restricted')).toBeVisible();

    // 6. Navigate directly to /admin/payments -> Verify Access Restricted barrier
    await invPage.goto('/admin/payments');
    await expect(invPage.locator('text=Super Admin Privileges Required')).toBeVisible({ timeout: 15000 });

    await context.close();
  });
});
