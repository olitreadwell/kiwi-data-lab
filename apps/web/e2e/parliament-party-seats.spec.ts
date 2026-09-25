import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { primeMinistersDuringYear } from '../src/lib/government-pms';

const PARLIAMENT_PATH = './politics/parliament-party-seats/';

test.describe('parliament party seats microsite', () => {
  test('@smoke labels the seat chart with the election years it shows', async ({ page }) => {
    await page.goto(PARLIAMENT_PATH);
    const seatChart = page.getByRole('application', { name: /Seats by party per parliament/ });
    await expect(seatChart).toBeVisible();

    // The first chart plots 1935 to 2023; before the seat-year fix every
    // x-axis tick read "0". Narrow viewports drop ticks that would collide,
    // so count the year-shaped labels rather than pinning every one.
    const tickLabels = await seatChart
      .locator('.recharts-cartesian-axis-tick-value')
      .allTextContents();
    const years = tickLabels.filter((label) => /^(19|20)\d\d$/.test(label)).map(Number);
    expect(years.length).toBeGreaterThanOrEqual(3);
    expect(years.at(-1)).toBe(2023);
    expect(years[0]).toBeGreaterThanOrEqual(1935);
    expect(years[0]).toBeLessThan(2023);
  });

  test('@smoke draws the share-of-the-house chart across the whole window', async ({ page }) => {
    await page.goto(PARLIAMENT_PATH);
    const shareChart = page.getByRole('application', {
      name: /Share of seats by party per parliament/,
    });
    await expect(shareChart).toBeVisible();

    // The bands must span the chart, not collapse into the left edge.
    const band = shareChart.locator('.recharts-area-area').first();
    const bandBox = await band.boundingBox();
    expect(bandBox?.width ?? 0).toBeGreaterThan(200);

    // The prime minister band only covers 1935 onward if the year data is real.
    const bandRects = shareChart.locator('.recharts-reference-area-rect');
    await expect(bandRects).not.toHaveCount(0);
    const latestBand = await bandRects.last().boundingBox();
    expect(latestBand?.width ?? 0).toBeGreaterThan(10);

    // Names inside the band are drawn only where they fit, so they show on a
    // desktop-width chart and are dropped on the narrower projects.
    if ((page.viewportSize()?.width ?? 0) >= 1000) {
      await expect(shareChart.getByText('Savage · Fraser')).toBeVisible();
      // The two most recent bands are the narrowest (2017-2023, 2023-2027),
      // so they are the first to lose their name. They must keep one here.
      await expect(shareChart.getByText(/^Ardern( · Hipkins| \+1)?$/)).toBeVisible();
      await expect(shareChart.getByText(/^Luxon$/)).toBeVisible();
    }
  });

  test('@smoke shows a readable tooltip naming the prime minister', async ({ page }) => {
    await page.goto(PARLIAMENT_PATH);
    const seatChart = page.getByRole('application', { name: /Seats by party per parliament/ });
    await expect(seatChart).toBeVisible();
    await seatChart.hover({ position: { x: 150, y: 120 } });

    const tooltip = page
      .locator('.recharts-wrapper')
      .filter({ has: seatChart })
      .locator('.recharts-tooltip-wrapper > div');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(/^(19|20)\d\d/);
    const background = await tooltip.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    expect(background).not.toBe('rgba(0, 0, 0, 0)');

    // The tooltip has to name the prime minister of the hovered year, not just
    // the party: a band labelled "Ardern +1" cannot say who held the job.
    const year = Number((await tooltip.textContent())?.slice(0, 4));
    const holders = primeMinistersDuringYear(year).map((holder) => holder.name);
    expect(holders.length, `no prime minister for ${String(year)}`).toBeGreaterThan(0);
    await expect(tooltip).toContainText(
      `${holders.length > 1 ? 'Prime ministers' : 'Prime minister'}: ${holders.join(', ')}`,
    );
  });

  test('@smoke names the prime minister in the share chart tooltip too', async ({ page }) => {
    await page.goto(PARLIAMENT_PATH);
    const shareChart = page.getByRole('application', {
      name: /Share of seats by party per parliament/,
    });
    await expect(shareChart).toBeVisible();
    await shareChart.hover({ position: { x: 200, y: 150 } });

    const tooltip = page
      .locator('.recharts-wrapper')
      .filter({ has: shareChart })
      .locator('.recharts-tooltip-wrapper > div');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(/^(19|20)\d\d/);
    await expect(tooltip).toContainText(/Prime minister(s)?: [A-Z]/);
  });

  test('@smoke reads as a published microsite, not a bare experiment', async ({ page }) => {
    await page.goto(PARLIAMENT_PATH);
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Politics & government' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Key facts' })).toBeVisible();
    await expect(page.getByText('Sources and further reading')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Parliament (Te Ara)' })).toBeVisible();
    await expect(page.getByTestId('parliament-elections')).toHaveText('30');
  });

  test('@a11y no axe violations on the parliament microsite', async ({ page }) => {
    await page.goto(PARLIAMENT_PATH);
    await expect(page.getByRole('main')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
