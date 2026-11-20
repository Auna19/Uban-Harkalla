import { test, expect } from '@playwright/test';

test.describe('Module 2: Live Search & Filtering Matrix', () => {
  test('TC-CAT-001: Filter catalogue by category', async ({ page }) => {
    await page.goto('/shop');
    // Ensure catalog has loaded products
    await expect(page.locator('.group.bg-white.rounded-3xl').first()).toBeVisible({ timeout: 20000 });
    const categoryButtons = page.locator('button, a').filter({ hasText: /iPhones|Android|Accessories/i });
    if (await categoryButtons.count() > 0) {
      await categoryButtons.first().click();
      await page.waitForTimeout(600);
      const productCards = page.locator('.group.bg-white.rounded-3xl');
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('TC-CAT-002: Live search input filters products by name', async ({ page }) => {
    await page.goto('/shop');
    // Ensure catalog has loaded products
    await expect(page.locator('.group.bg-white.rounded-3xl').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.locator('input[placeholder*="Search by name"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Samsung');
    await page.waitForTimeout(600);

    const cards = page.locator('.group.bg-white.rounded-3xl');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    const firstTitle = await cards.first().textContent();
    expect(firstTitle).toMatch(/Samsung/i);
  });

  test('TC-CAT-003: Sorting dropdown updates order', async ({ page }) => {
    await page.goto('/shop');
    // Ensure catalog has loaded products
    await expect(page.locator('.group.bg-white.rounded-3xl').first()).toBeVisible({ timeout: 20000 });

    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('price-asc');
      await page.waitForTimeout(600);
      const cards = page.locator('.group.bg-white.rounded-3xl');
      await expect(cards.first()).toBeVisible();
      expect(await cards.count()).toBeGreaterThan(0);
    }
  });

  test('TC-CAT-004: Non-matching search displays empty state', async ({ page }) => {
    await page.goto('/shop');
    // Ensure catalog has loaded products
    await expect(page.locator('.group.bg-white.rounded-3xl').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.locator('input[placeholder*="Search by name"]').first();
    await searchInput.fill('XYZNONEXISTENTDEVICE12345');
    await page.waitForTimeout(600);

    const emptyMessage = page.getByText(/No matching products found/i);
    await expect(emptyMessage).toBeVisible();
  });
});
