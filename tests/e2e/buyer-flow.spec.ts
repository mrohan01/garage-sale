import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  registerUser,
  authenticateInBrowser,
  navigateToSaleFromHome,
  createSaleViaApi,
  activateSaleViaApi,
  createListingViaApi,
} from './helpers';

test.describe('Buyer Flow', () => {
  let sellerTokens: any;
  let buyerTokens: any;
  let sale: any;
  let listing1: any;
  let listing2: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('seller');
    sellerTokens = await registerUser(sellerEmail, 'Buyer Test Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    sale = await createSaleViaApi(sellerTokens, {
      title: 'Buyer Test Sale',
      description: 'Sale for buyer E2E tests',
      address: '120 S Main St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    listing1 = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Test Bookshelf',
      description: 'A nice wooden bookshelf',
      startingPrice: 50,
      minimumPrice: 20,
      category: 'Furniture',
      condition: 'GOOD',
    });

    listing2 = await createListingViaApi(sellerTokens, sale.id, {
      title: 'Test Coffee Maker',
      description: 'Barely used espresso machine',
      startingPrice: 75,
      minimumPrice: 30,
      category: 'Kitchen',
      condition: 'LIKE_NEW',
    });

    const buyerEmail = uniqueEmail('buyer');
    buyerTokens = await registerUser(buyerEmail, 'Test Buyer');
  });

  test('buyer can register and see the home screen', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });
  });

  test('buyer can view a sale and its listings from home', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await navigateToSaleFromHome(page, 'Buyer Test Sale');

    await expect(page.getByText(/Items \(\d+\)/)).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Test Bookshelf')).toBeVisible();
    await expect(page.getByText('Test Coffee Maker')).toBeVisible();
  });

  test('buyer can drill into a listing detail', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await navigateToSaleFromHome(page, 'Buyer Test Sale');
    await expect(page.getByText('Test Bookshelf')).toBeVisible({ timeout: 10000 });

    await page.getByText('Test Bookshelf').click();

    await expect(page.getByText('$50.00').last()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Furniture').last()).toBeVisible();
    await expect(page.getByText('AVAILABLE').last()).toBeVisible();
  });

  test('buyer can save a listing', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await navigateToSaleFromHome(page, 'Buyer Test Sale');
    await expect(page.getByText('Test Bookshelf')).toBeVisible({ timeout: 10000 });
    await page.getByText('Test Bookshelf').click();
    await expect(page.getByText('$50.00').last()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible({ timeout: 10000 });

    await page.getByText('Profile').first().click();
    await page.getByText('Saved Items').click({ timeout: 10000 });
    await expect(page.getByText('Test Bookshelf').last()).toBeVisible({ timeout: 10000 });
  });

  test('buyer can view sales on the map', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 });
  });
});
