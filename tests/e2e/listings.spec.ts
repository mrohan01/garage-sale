import { test, expect } from '@playwright/test';

test.describe('Listings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'seller@example.com');
    await page.fill('[data-testid="login-password"]', 'SecurePass123!');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
  });

  test('user can create a sale and add listings', async ({ page }) => {
    await page.click('[data-testid="create-sale-button"]');

    await page.fill('[data-testid="sale-title"]', 'Weekend Garage Sale');
    await page.fill('[data-testid="sale-address"]', '123 Main St');
    await page.fill('[data-testid="sale-description"]', 'Lots of great items!');
    await page.click('[data-testid="sale-submit"]');

    await expect(page.locator('[data-testid="sale-detail"]')).toBeVisible({ timeout: 10000 });

    await page.click('[data-testid="add-listing-button"]');
    await page.fill('[data-testid="listing-title"]', 'Vintage Lamp');
    await page.fill('[data-testid="listing-price"]', '25.00');
    await page.fill('[data-testid="listing-description"]', 'Beautiful vintage table lamp');
    await page.click('[data-testid="listing-submit"]');

    await expect(page.locator('text=Vintage Lamp')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$25.00')).toBeVisible();
  });

  test('user can search for listings', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'vintage');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="search-result-item"]').first()).toBeVisible();
  });
});
