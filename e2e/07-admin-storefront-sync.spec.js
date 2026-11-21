import { test, expect } from '@playwright/test';

test.describe.serial('Module 7: Admin to Storefront Cross-Browser Data & Image Sync', () => {
  const timestamp = Date.now();
  const testProductName = `Sync Flagship ${timestamp}`;
  const testProductSlug = `sync-flagship-${timestamp}`;
  const initialImage = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80';
  const updatedImage = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';

  test('TC-SYNC-001: Admin creates product with image -> Reflected on Landing Page & Shop in a clean browser session', async ({ browser }) => {
    test.setTimeout(120000);

    // 1. Admin Browser Context (Simulating Admin User)
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/admin/login');
    await adminPage.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await adminPage.locator('input[type="password"]').fill('admin123');
    await adminPage.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(adminPage).toHaveURL(/.*\/admin\/dashboard/, { timeout: 30000 });

    // Navigate to Create Product
    await adminPage.goto('/admin/products/create');
    await expect(adminPage.locator('h1')).toContainText(/Create New Product/i, { timeout: 30000 });

    // Fill Product Details
    await adminPage.locator('input[placeholder*="iPhone 15 Pro Max"]').fill(testProductName);
    
    // Add custom image
    const addImageInput = adminPage.locator('input[placeholder*="paste image URL"]');
    await addImageInput.fill(initialImage);
    const addImageBtn = adminPage.getByRole('button', { name: /Add Image URL/i });
    await addImageBtn.click();

    // Fill prices and stock (Base price: 850,000, Discounted promo price: 780,000)
    const basePriceInput = adminPage.locator('input[type="number"]').first();
    await basePriceInput.fill('850000');
    const discountPriceInput = adminPage.locator('input[placeholder*="promo price"]');
    await discountPriceInput.fill('780000');

    const shortDesc = adminPage.locator('input[placeholder*="Titanium design"]');
    await shortDesc.fill('Next-generation sync test smartphone flagship with 5G.');

    // Save Product
    const saveBtn = adminPage.locator('button[type="submit"]');
    await saveBtn.click();

    // Verify redirected back to product inventory list
    await expect(adminPage).toHaveURL(/.*\/admin\/products\/?$/, { timeout: 35000 });
    await expect(adminPage.locator('tbody tr').first()).toBeVisible({ timeout: 30000 });
    await expect(adminPage.locator('table')).toContainText(testProductName, { timeout: 30000 });

    // 2. Client Browser Context (Simulating a fresh user on Edge/Opera/Mobile with clean localStorage)
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    // Navigate to Homepage / Landing Page
    await clientPage.goto('/');
    
    // Assert the new product appears on the Landing Page and displays active discounted price and commas
    const landingProductCard = clientPage.locator('.group', { hasText: testProductName }).first();
    await landingProductCard.scrollIntoViewIfNeeded();
    await expect(landingProductCard).toBeVisible({ timeout: 35000 });
    await expect(landingProductCard).toContainText('₦780,000');
    await expect(landingProductCard).toContainText('₦850,000');
    await expect(landingProductCard).toContainText('Save ₦70,000');

    // Navigate to Shop Catalog
    await clientPage.goto('/shop');
    // Wait for skeleton loaders to disappear
    await expect(clientPage.getByTestId('shop-loading-skeleton')).toHaveCount(0, { timeout: 35000 });

    const shopSearch = clientPage.locator('input[placeholder*="Search by name"]').first();
    await expect(shopSearch).toBeVisible({ timeout: 20000 });
    await shopSearch.fill(testProductName);
    await clientPage.waitForTimeout(600);

    const catalogCard = clientPage.locator(`text=${testProductName}`).first();
    await expect(catalogCard).toBeVisible({ timeout: 25000 });

    // Verify Image displayed matches
    const cardImg = clientPage.locator(`img[alt*="${testProductName}"]`).first();
    await expect(cardImg).toBeVisible();

    await adminContext.close();
    await clientContext.close();
  });

  test('TC-SYNC-002: Admin updates existing product image -> Reflected on Product Details Page in clean session', async ({ browser }) => {
    test.setTimeout(120000);

    // 1. Admin Updates Product Image
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/admin/login');
    await adminPage.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await adminPage.locator('input[type="password"]').fill('admin123');
    await adminPage.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(adminPage).toHaveURL(/.*\/admin\/dashboard/, { timeout: 30000 });

    await adminPage.goto('/admin/products');
    
    // Find the product we created in TC-SYNC-001
    const row = adminPage.locator('tbody tr', { hasText: testProductName }).first();
    await expect(row).toBeVisible({ timeout: 25000 });
    await row.locator('a[title*="Edit Product"]').click();

    await expect(adminPage.locator('h1')).toContainText(/Edit Product/i, { timeout: 30000 });

    // Add updated image URL
    const addImageInput = adminPage.locator('input[placeholder*="paste image URL"]');
    await addImageInput.fill(updatedImage);
    const addImageBtn = adminPage.getByRole('button', { name: /Add Image URL/i });
    await addImageBtn.click();

    // Save changes
    const saveBtn = adminPage.locator('button[type="submit"]');
    await saveBtn.click();
    await expect(adminPage).toHaveURL(/.*\/admin\/products\/?$/, { timeout: 35000 });

    // 2. Client Browser Context (Clean session)
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    await clientPage.goto(`/product/${testProductSlug}`);
    
    // Check product page
    const prodHeading = clientPage.locator('h1').first();
    await expect(prodHeading).toContainText(testProductName, { timeout: 30000 });

    const mainImg = clientPage.locator('img').first();
    await expect(mainImg).toBeVisible();

    await adminContext.close();
    await clientContext.close();
  });

  test('TC-SYNC-003: Category Image Update in Admin reflects on Landing Page category cards', async ({ browser }) => {
    test.setTimeout(120000);

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/admin/login');
    await adminPage.locator('input[type="email"]').fill('admin@ubanharkalla.com');
    await adminPage.locator('input[type="password"]').fill('admin123');
    await adminPage.getByRole('button', { name: /Access Dashboard|Login/i }).click();
    await expect(adminPage).toHaveURL(/.*\/admin\/dashboard/, { timeout: 30000 });

    await adminPage.goto('/admin/categories');
    await expect(adminPage.locator('h1')).toContainText(/Categories/i, { timeout: 30000 });

    const editBtns = adminPage.locator('button[title="Edit Category"]');
    await expect(editBtns.first()).toBeVisible({ timeout: 25000 });
    const count = await editBtns.count();
    expect(count).toBeGreaterThan(0);

    // Client verifies categories on home page
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await clientPage.goto('/');

    const categoryElements = clientPage.locator('a, button').filter({ hasText: /Apple iPhones|Android|Gadgets|Accessories/i });
    await expect(categoryElements.first()).toBeVisible({ timeout: 30000 });
    expect(await categoryElements.count()).toBeGreaterThan(0);

    await adminContext.close();
    await clientContext.close();
  });
});
