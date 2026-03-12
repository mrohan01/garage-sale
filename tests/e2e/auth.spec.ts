import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, authenticateInBrowser } from './helpers';

test.describe('Authentication', () => {
  test('unauthenticated user sees login form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  });

  test('user can navigate to register form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });

    await page.getByText('Register').click();

    await expect(page.locator('[data-testid="register-name"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="register-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-submit"]')).toBeVisible();
  });

  test('register form shows validation errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });
    await page.getByText('Register').click();
    await expect(page.locator('[data-testid="register-submit"]')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="register-submit"]').click();

    await expect(page.locator('[data-testid="error-email"]')).toBeVisible({ timeout: 5000 });
  });

  test('registered user can authenticate and access the app', async ({ page }) => {
    const email = uniqueEmail('auth-test');
    const tokens = await registerUser(email, 'Auth Test User');
    await authenticateInBrowser(page, tokens);

    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });

  test('user can log out and log back in', async ({ page }) => {
    const email = uniqueEmail('relogin');
    const tokens = await registerUser(email, 'Relogin User');
    await authenticateInBrowser(page, tokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible({ timeout: 10000 });

    const freshTokens = await loginUser(email);
    await authenticateInBrowser(page, freshTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });
});
