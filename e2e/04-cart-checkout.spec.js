import { test, expect } from '@playwright/test';

test.describe('Module 4: Cart Management & Checkout Order Flow', () => {
  test('TC-CART-001: Complete Add to Cart, Quantity Update, and Modal Removal', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    // Go to cart
    await page.goto('/cart');
    await expect(page.locator('text=Apple iPhone 15 Pro Max').first()).toBeVisible();

    // Increment quantity
    const plusBtn = page.locator('button:has-text("+")').first();
    await plusBtn.click();
    await page.waitForTimeout(400);

    // Open removal confirmation modal
    const removeBtn = page.locator('button[title="Remove item"]').first();
    await removeBtn.click();

    // Check modal contents
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Remove Item From Cart?');
    await expect(modal).toContainText('Apple iPhone 15 Pro Max');
    // Ensure "undefined" NEVER appears
    await expect(modal).not.toContainText('undefined');

    // Cancel modal
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('TC-CHK-001: End-to-end Checkout and Order Reference Generation', async ({ page }) => {
    // Add product to cart first
    await page.goto('/product/apple-iphone-15-pro-max');
    const addBtn = page.getByRole('button', { name: /Add to Shopping Cart/i });
    await addBtn.click();

    // Go to checkout
    await page.goto('/checkout');
    await expect(page.locator('h1, h2').filter({ hasText: /Checkout/i }).first()).toBeVisible();

    // Fill customer details
    await page.locator('input[placeholder*="Musa Abdullahi"]').fill('Automated QA User');
    await page.locator('input[placeholder*="08012345678"]').fill('08012345678');
    await page.locator('input[placeholder*="aliyu@example.com"]').fill('automated_qa@example.com');
    await page.locator('input[placeholder*="Nassarawa GRA"]').fill('Kano Metropolis');
    await page.locator('input[placeholder*="Zoo Road"]').fill('No. 1 Test Lab Road');

    // Select payment method radio: Pay on Delivery or Bank Transfer with Session ID
    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();
    if (radioCount >= 3) {
      await radios.nth(2).check(); // Pay on Delivery
    } else {
      await radios.nth(1).check(); // Bank Transfer
      const sessionInput = page.locator('input[placeholder*="100004928472910"]');
      if (await sessionInput.isVisible()) {
        await sessionInput.fill('TXN-' + Date.now());
      }
    }

    // Submit order
    const orderBtn = page.getByRole('button', { name: /Confirm & Place Order/i });
    await orderBtn.click();

    // Verify success page and order reference with generous timeout for database insert
    await expect(page).toHaveURL(/.*\/checkout\/success\?ref=UBH-.*/, { timeout: 25000 });
    const orderRefCode = page.locator('.font-mono').filter({ hasText: 'UBH-' }).first();
    await expect(orderRefCode).toBeVisible({ timeout: 15000 });
    const refText = await orderRefCode.textContent();
    expect(refText).toMatch(/UBH-\d{4}-\d+/);
  });
});
