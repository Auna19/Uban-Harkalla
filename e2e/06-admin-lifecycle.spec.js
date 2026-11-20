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
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test('TC-ADM-004: Admin Customer Directory lists customers', async ({ page }) => {
    await page.goto('/admin/customers');
    await expect(page.locator('h1')).toContainText(/Customer/i);

    // Should list customers
    const rows = page.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
  });
});
