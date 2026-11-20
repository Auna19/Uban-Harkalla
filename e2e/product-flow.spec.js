import { test, expect } from '@playwright/test';

test.describe('E2E Product and Cart Flows', () => {
  test('Landing page loads and displays featured products', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/UBAN HARKALLA/i);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('Add Apple iPhone 15 Pro Max to cart and open removal modal', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    
    // Verify product title
    const title = page.locator('h1');
    await expect(title).toContainText('Apple iPhone 15 Pro Max');

    // Click Add to Shopping Cart
    const addToCartBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addToCartBtn).toBeEnabled();
    await addToCartBtn.click();

    // Navigate to Cart
    await page.goto('/cart');
    await expect(page.locator('text=Apple iPhone 15 Pro Max').first()).toBeVisible();

    // Click Remove Item
    const removeBtn = page.locator('button[title="Remove item"]').first();
    await removeBtn.click();

    // Verify confirmation modal is open with proper non-overflowing text
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Remove Item From Cart?');
    await expect(modal).toContainText('Apple iPhone 15 Pro Max');

    // Click Cancel
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });
});
