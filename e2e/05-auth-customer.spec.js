import { test, expect } from '@playwright/test';

test.describe('Module 5: Customer Authentication & Self-Service Portal', () => {
  test('TC-AUTH-001: Sign up form requires valid inputs', async ({ page }) => {
    await page.goto('/signup');
    const submitBtn = page.getByRole('button', { name: /Create Account|Sign Up/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Form should remain on signup page due to HTML5 validation
      await expect(page).toHaveURL(/.*\/signup/);
    }
  });

  test('TC-AUTH-002: Customer Login and Dashboard Navigation', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill('customer@ubanharkalla.com');
    await passwordInput.fill('customer123');

    const submitBtn = page.getByRole('button', { name: /Sign In|Login/i }).first();
    await submitBtn.click();

    // Verify authenticated redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Navigate to Customer Orders
    const ordersLink = page.getByRole('link', { name: /Orders|My Orders/i }).first();
    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await expect(page).toHaveURL(/.*\/dashboard\/orders/);
    }
  });
});
