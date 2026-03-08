import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search results display correctly', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'furniture');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('[data-testid="search-results"]')).toBeVisible({ timeout: 10000 });

    const results = page.locator('[data-testid="search-result-item"]');
    await expect(results.first()).toBeVisible();

    const firstResult = results.first();
    await expect(firstResult.locator('[data-testid="result-title"]')).toBeVisible();
    await expect(firstResult.locator('[data-testid="result-price"]')).toBeVisible();
  });

  test('empty search shows appropriate message', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'xyznonexistentitem123456');
    await page.press('[data-testid="search-input"]', 'Enter');

    await expect(page.locator('[data-testid="search-empty"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="search-empty"]')).toContainText(/no results/i);
  });
});
