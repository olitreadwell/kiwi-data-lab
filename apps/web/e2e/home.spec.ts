import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { micrositePathFor, MICROSITES } from '../src/lib/microsites';

test.describe('home', () => {
  test('@critical renders the landing page with microsite cards', async ({ page }) => {
    // Relative URL (no leading slash) so it resolves against the baseURL path
    // (the site may be served under a base path).
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // One card per published microsite, no more and no fewer.
    for (const microsite of MICROSITES) {
      const href = micrositePathFor(microsite);
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
  });

  test('@critical opens a microsite story from its card', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /national animal is in freefall/i }).click();
    await expect(page.getByRole('img', { name: /sheep numbers/i })).toBeVisible();
    await expect(page.getByText('Sources and further reading')).toBeVisible();
  });

  test('@critical opens the parliament story from its card', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /which party held the most seats/i }).click();
    await expect(page).toHaveURL(/\/politics\/parliament-party-seats/);
    await expect(page.getByTestId('parliament-elections')).toHaveText('30');
  });

  test('@critical @a11y no a11y violations on the landing page', async ({ page }) => {
    await page.goto('./');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('@smoke shows a plausible live sheep count', async ({ page }) => {
    await page.goto('./agriculture/sheep-index');
    const latest = await page.getAttribute('[data-testid="sheep-latest"]', 'data-value');
    expect(latest).not.toBeNull();
    const sheep = Number(latest);
    expect(Number.isFinite(sheep)).toBe(true);
    expect(sheep).toBeGreaterThan(20000000);
    expect(sheep).toBeLessThan(27000000);
  });
});
