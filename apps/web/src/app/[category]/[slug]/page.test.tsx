import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CATEGORY_SLUGS, MICROSITES } from '@/lib/microsites';

import MicrositePage, { generateMetadata } from './page';

/** Builds the category/slug params for a microsite, or a miss for unknown slugs. */
function paramsFor(slug: string): { category: string; slug: string } {
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  return {
    category: microsite === undefined ? 'nope' : CATEGORY_SLUGS[microsite.category],
    slug,
  };
}

const notFoundMock = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: (): never => {
    notFoundMock();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/lib/sheep-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/sheep-data')>();
  return {
    ...actual,
    fetchSheepSeries: vi.fn().mockResolvedValue({
      points: [
        { year: 1994, sheep: 49466054 },
        { year: 2025, sheep: 23252463 },
      ],
      first: { year: 1994, sheep: 49466054 },
      peak: { year: 1994, sheep: 49466054 },
      latest: { year: 2025, sheep: 23252463 },
      changeFromFirstPercent: -53,
      changeFromPeakPercent: -53,
    }),
  };
});

vi.mock('@/lib/parliament-datastore', () => ({
  fetchParliamentPartySeats: vi.fn().mockResolvedValue({
    source: 'datastore',
    rows: [
      {
        parliament: 25,
        electionYear: 1935,
        largestParty: 'New Zealand Labour Party',
        largestSeats: 53,
        parties: [
          { party: 'New Zealand Labour Party', seats: 53 },
          { party: 'New Zealand National Party', seats: 19 },
        ],
      },
      {
        parliament: 54,
        electionYear: 2023,
        largestParty: 'New Zealand National Party',
        largestSeats: 48,
        parties: [
          { party: 'New Zealand National Party', seats: 48 },
          { party: 'New Zealand Labour Party', seats: 34 },
        ],
      },
    ],
  }),
}));

describe('MicrositePage', () => {
  it('renders the sheep story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('sheep-index'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('national animal is in freefall');
    expect(html).toContain('70 million sheep');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Open source data');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('Sheep number falls to six for each person');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('href="/agriculture"');
    expect(html).toContain('Sheep index');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('renders exactly one h1 with the microsite title before any h2', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('sheep-index'))} />,
    );
    const html = await new Response(stream).text();
    const h1s = html.match(/<h1[^>]*>(.*?)<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toContain('national animal is in freefall');
    const headingIndexes = ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6']
      .map((tag) => html.indexOf(tag))
      .filter((index) => index !== -1);
    expect(Math.min(...headingIndexes)).toBe(html.indexOf('<h1'));
  });

  it('returns a unique document title for the sheep microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('sheep-index')) }),
    ).resolves.toEqual({
      title: 'Sheep index - kiwi-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Sheep index - kiwi-data-lab',
        description: expect.any(String),
        url: '/agriculture/sheep-index/',
        type: 'article',
      },
    });
  });

  it('returns a generic title for an unknown microsite', async () => {
    await expect(generateMetadata({ params: Promise.resolve(paramsFor('nope')) })).resolves.toEqual(
      {
        title: 'kiwi-data-lab',
      },
    );
  });

  it('renders the parliament story at its politics path', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('parliament-party-seats'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('Which party held the most seats, election by election.');
    expect(html).toContain('href="/politics"');
    expect(html).toContain('Elections shown');
    expect(html).toContain('Government changes');
    expect(html).toContain('Share of the house, and who held the top job.');
    expect(html).toContain('Seat counts were fetched from the datastore');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });
});
