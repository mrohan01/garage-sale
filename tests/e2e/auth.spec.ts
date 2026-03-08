import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register a new account', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[data-testid="register-name"]', 'Test User');
    await page.fill('[data-testid="register-email"]', `test+${Date.now()}@example.com`);
    await page.fill('[data-testid="register-password"]', 'SecurePass123!');
    await page.fill('[data-testid="register-confirm-password"]', 'SecurePass123!');
    await page.click('[data-testid="register-submit"]');

    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
  });

  test('user can login with existing account', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'SecurePass123!');
    await page.click('[data-testid="login-submit"]');

    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 10000 });
  });

  test('user sees validation errors with empty form', async ({ page }) => {
    await page.goto('/register');

    await page.click('[data-testid="register-submit"]');

    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-password"]')).toBeVisible();
  });
});
