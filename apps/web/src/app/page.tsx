import { Container, Stack } from '@nzlab/ui';
import Link from 'next/link';

import { MicrositeGallery } from '@/components/MicrositeGallery';
import type { MicrositeGalleryCard } from '@/components/MicrositeGallery';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import { env } from '@/env';
import { categorySlugFor, MICROSITES } from '@/lib/microsites';
import type { MicrositeConfig } from '@/lib/microsites';
import { fetchSheepSeries } from '@/lib/sheep-data';
import { formatMillions as formatMillionsSheep } from '@/lib/sheep-format';

function getMicrosite(slug: string): MicrositeConfig | undefined {
  return MICROSITES.find((candidate) => candidate.slug === slug);
}

export default async function HomePage(): Promise<React.ReactElement> {
  const [sheep] = await Promise.all([fetchSheepSeries(env.STATS_NZ_SUBSCRIPTION_KEY)]);

  const cards = [
    {
      config: getMicrosite('sheep-index'),
      statLabel: `Sheep right now (${sheep.latest.year})`,
      statValue: formatMillionsSheep(sheep.latest.sheep),
    },
  ].filter(
    (card): card is { config: MicrositeConfig; statLabel: string; statValue: string } =>
      card.config !== undefined,
  );
  // The home page shows every published microsite; only the curated ones carry a
  // headline stat fetched at deploy time.
  const statBySlug = new Map(
    cards.map((card) => [
      card.config.slug,
      { statLabel: card.statLabel, statValue: card.statValue },
    ]),
  );
  // The full microsite list is in ship order (oldest first); show the newest first.
  const galleryCards: MicrositeGalleryCard[] = [...MICROSITES].reverse().map((config) => {
    const stat = statBySlug.get(config.slug);
    return {
      slug: config.slug,
      categorySlug: categorySlugFor(config),
      eyebrow: config.eyebrow,
      title: config.title,
      description: config.description,
      accent: config.accent,
      dataSource: config.dataSource,
      chartType: config.chartType,
      category: config.category,
      ...(stat !== undefined ? { statLabel: stat.statLabel, statValue: stat.statValue } : {}),
    };
  });

  return (
    <>
      <Container size="wide">
        <Stack className="max-w-3xl gap-4 py-[var(--spacing-2xl)]">
          <h1 className="numeral-heading-3xl">
            Small experiments digging through New Zealand public data for the funny and the
            surprising.
          </h1>
          <p className="numeral-paragraph-lg text-[var(--color-muted)]">
            {galleryCards.length} live microsite{galleryCards.length === 1 ? '' : 's'}. Stats NZ at
            deploy time, plus GeoNet, NZOR, data.govt.nz, DigitalNZ, Trade Me, iNaturalist, GBIF,
            and Wikipedia live from the browser.
          </p>
        </Stack>
        <div className="pb-[var(--spacing-3xl)]">
          {' '}
          <Link
            href="/experiments/parliament-party-seats"
            className="text-decoration-none mt-10 block max-w-3xl rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 transition-colors hover:border-[var(--color-fg)]"
          >
            <span className="numeral-text-eyebrow text-[var(--color-muted)]">
              experiment / parliament-party-seats
            </span>
            <span className="numeral-heading-2xl mt-2 block">
              Which party held the most seats, election by election.
            </span>
            <span className="numeral-paragraph-sm mt-2 block text-[var(--color-muted)]">
              Seats and share of the house for every election since 1984, with the prime minister of
              each era.
            </span>
          </Link>
          <MicrositeGallery cards={galleryCards} />
        </div>
      </Container>
      <ReportIssueButton />
    </>
  );
}
