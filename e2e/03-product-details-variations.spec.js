import { test, expect } from '@playwright/test';

test.describe('Module 3: Product Detail Engine & Variation Matrix', () => {
  test('TC-PROD-001: Load product detail with specifications and gallery', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    await expect(page.locator('h1')).toContainText('Apple iPhone 15 Pro Max', { timeout: 25000 });

    // Hero image is visible
    const heroImg = page.locator('img[alt*="Apple iPhone 15 Pro Max"]').first();
    await expect(heroImg).toBeVisible();

    // Technical specifications tab
    const specsTabBtn = page.getByRole('button', { name: 'Full Technical Specifications' });
    if (await specsTabBtn.isVisible()) {
      await specsTabBtn.click();
      await expect(page.locator('#specs-section')).toBeVisible();
    }
  });

  test('TC-PROD-002: Variation selection updates pricing dynamically', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    await expect(page.locator('h1')).toContainText('Apple iPhone 15 Pro Max', { timeout: 25000 });

    const priceEl = page.locator('span, div').filter({ hasText: /^₦/ }).first();
    await expect(priceEl).toBeVisible();

    // Select 256GB variation
    const btn256 = page.getByRole('button', { name: /^256GB$/i });
    const btn512 = page.getByRole('button', { name: /^512GB$/i });

    if (await btn256.isVisible() && await btn512.isVisible()) {
      await btn256.click();
      await page.waitForTimeout(500);
      const price256 = await priceEl.textContent();

      // Switch to 512GB variation - price must update dynamically
      await btn512.click();
      await page.waitForTimeout(500);
      const price512 = await priceEl.textContent();

      expect(price512).not.toBe(price256);
    }
  });

  test('TC-PROD-003: WhatsApp Order CTA generates prefilled message', async ({ page }) => {
    await page.goto('/product/apple-iphone-15-pro-max');
    const waLink = page.getByRole('link', { name: /Order via WhatsApp/i });
    await expect(waLink).toBeVisible();
    const href = await waLink.getAttribute('href');
    expect(href).toContain('https://wa.me/2348123456789');
    expect(href).toContain('Apple%20iPhone%2015%20Pro%20Max');
    expect(href).toContain('text=');
  });

  test('TC-PROD-004: Non-existent product slug renders 404 boundary', async ({ page }) => {
    await page.goto('/product/invalid-slug-404-test');
    await expect(page.locator('text=Product Not Found')).toBeVisible();
    const returnBtn = page.getByRole('link', { name: 'Return to Catalogue' });
    await expect(returnBtn).toBeVisible();
  });

  test('TC-PROD-005: Comma-formatted pricing, active discounted price and savings badge display properly', async ({ page }) => {
    // Check Landing page product card pricing display
    await page.goto('/');
    const productCard = page.locator('.group', { hasText: 'Apple iPhone 15 Pro Max' }).first();
    await expect(productCard).toBeVisible({ timeout: 25000 });

    // Assert prices follow Nigerian Naira thousands comma format (e.g. ₦1,580,000)
    const cardText = await productCard.innerText();
    expect(cardText).toMatch(/₦\d{1,3}(,\d{3})+/);

    // Save badge has comma formatting e.g. Save ₦70,000
    if (cardText.includes('Save')) {
      expect(cardText).toMatch(/Save\s+₦\d{1,3}(,\d{3})+/);
    }

    // Now navigate to PDP
    await page.goto('/product/apple-iphone-15-pro-max');
    await expect(page.locator('h1')).toContainText('Apple iPhone 15 Pro Max', { timeout: 25000 });

    // Verify main PDP price has commas
    const pdpPrice = page.locator('span.text-3xl, span.text-4xl').first();
    await expect(pdpPrice).toBeVisible();
    const pdpPriceText = await pdpPrice.textContent();
    expect(pdpPriceText).toMatch(/^₦\d{1,3}(,\d{3})+$/);
  });
});
