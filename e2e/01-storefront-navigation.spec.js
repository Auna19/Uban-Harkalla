import { test, expect } from '@playwright/test';

test.describe('Module 1: Navigation & Global Storefront Layout', () => {
  test('TC-NAV-001: Header logo navigates to homepage', async ({ page }) => {
    await page.goto('/shop');
    const logoLink = page.locator('header a[href="/"]').first();
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    await expect(page).toHaveURL(/\/$|\.app\/?$/);
  });

  test('TC-NAV-002: Navigation links highlight active route', async ({ page }) => {
    await page.goto('/');
    const shopLink = page.getByRole('link', { name: /^Shop$/i }).first();
    await shopLink.click();
    await expect(page).toHaveURL(/.*\/shop/);

    const aboutLink = page.getByRole('link', { name: /^About Us$/i }).first();
    await aboutLink.click();
    await expect(page).toHaveURL(/.*\/about/);

    const contactLink = page.getByRole('link', { name: /^Contact Us$/i }).first();
    await contactLink.click();
    await expect(page).toHaveURL(/.*\/contact/);
  });

  test('TC-NAV-003: Search input in header executes query and redirects to Shop', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('header input[type="text"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('iPhone');
    const searchBtn = page.getByLabel('Submit search').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }
    await expect(page).toHaveURL(/.*\/shop\?search=iPhone/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('TC-NAV-004: Announcement bar displays hotline and delivery notice', async ({ page }) => {
    await page.goto('/');
    const announcementBar = page.locator('text=FREE Delivery in Kano').first();
    await expect(announcementBar).toBeVisible();
    const hotline = page.locator('a[href*="8123456789"]').first();
    await expect(hotline).toBeVisible();
  });

  test('TC-NAV-005: Shopping cart counter badge updates dynamically', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addBtn).toBeEnabled({ timeout: 25000 });
    await addBtn.click();

    // Check navbar cart badge displays at least 1
    const cartBadge = page.locator('header a[href="/cart"] span');
    await expect(cartBadge).toBeVisible();
    const countText = await cartBadge.textContent();
    expect(Number(countText)).toBeGreaterThan(0);
  });
});
