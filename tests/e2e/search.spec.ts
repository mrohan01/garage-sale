import { test, expect } from '@playwright/test';
import {
  uniqueEmail,
  registerUser,
  authenticateInBrowser,
  createSaleViaApi,
  activateSaleViaApi,
  createListingViaApi,
} from './helpers';

test.describe('Search and Discovery', () => {
  let buyerTokens: any;

  test.beforeAll(async () => {
    const sellerEmail = uniqueEmail('search-seller');
    const sellerTokens = await registerUser(sellerEmail, 'Search Seller');

    const startsAt = new Date(Date.now() - 3600000).toISOString();
    const endsAt = new Date(Date.now() + 86400000 * 3).toISOString();

    const sale = await createSaleViaApi(sellerTokens, {
      title: 'Searchable Yard Sale',
      description: 'Has many items to search through',
      address: '600 Search St, Fredericktown, MO 63645',
      latitude: 37.5597,
      longitude: -90.2940,
      startsAt,
      endsAt,
    });

    await activateSaleViaApi(sellerTokens, sale.id);

    await createListingViaApi(sellerTokens, sale.id, {
      title: 'Rare Vinyl Records',
      startingPrice: 60,
      minimumPrice: 25,
      category: 'Collectibles',
    });

    await createListingViaApi(sellerTokens, sale.id, {
      title: 'Garden Hose Set',
      startingPrice: 20,
      minimumPrice: 10,
      category: 'Garden',
    });

    const buyerEmail = uniqueEmail('search-buyer');
    buyerTokens = await registerUser(buyerEmail, 'Search Buyer');
  });

  test('home screen search filters visible sales', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.locator('[data-testid="search-input"]').fill('Searchable');

    await expect(page.getByText('Searchable Yard Sale').first()).toBeVisible({ timeout: 10000 });
  });

  test('home screen search shows empty state for no matches', async ({ page }) => {
    await authenticateInBrowser(page, buyerTokens);
    await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: 15000 });

    await page.locator('[data-testid="search-input"]').fill('xyznonexistent123');

    await expect(page.getByText('No results found')).toBeVisible({ timeout: 10000 });
  });
});
