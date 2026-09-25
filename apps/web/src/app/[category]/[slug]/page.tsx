import { Container } from '@nzlab/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GovernmentPartyChart } from '@/components/GovernmentPartyChart';
import { GovernmentSeatShareChart } from '@/components/GovernmentSeatShareChart';
import { MicrositeStory } from '@/components/MicrositeStory';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import { SheepChart } from '@/components/SheepChart';
import { StatCard } from '@/components/StatCard';
import { env } from '@/env';
import { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-data';
import type { ParliamentSeatSource } from '@/lib/government-data';
import {
  categorySlugFor,
  freshnessLabelFor,
  micrositePathFor,
  MICROSITES,
  relatedMicrositesFor,
} from '@/lib/microsites';
import { fetchParliamentPartySeats } from '@/lib/parliament-datastore';
import { bucketKeyFor, PARTY_BUCKETS } from '@/lib/party-buckets';
import { fetchSheepSeries } from '@/lib/sheep-data';
import { formatMillions as formatMillionsSheep } from '@/lib/sheep-format';

/**
 * First parliament shown by the parliament story: the 25th, opened by the
 * 1935 election. That is the first Labour government and the start of the
 * Labour / National era these party buckets describe. Earlier parliaments
 * are run by parties (Liberal, Reform, United) that have no bucket of their
 * own.
 */
const FIRST_TWO_PARTY_PARLIAMENT = 25;

/** How the parliament story got its seat counts, stated on the page. */
const SOURCE_SENTENCE: Record<ParliamentSeatSource, string> = {
  datastore: 'Seat counts were fetched from the datastore when this page was built.',
  snapshot:
    'The datastore was unreachable when this page was built, so the counts come from a committed snapshot of the same table.',
};

const PARTY_LABELS = new Map(PARTY_BUCKETS.map((bucket) => [bucket.key, bucket.label]));

/**
 * Chart label for a party's full datastore name, so a stat card says
 * "National" where the chart legend does too.
 */
function bucketLabelForParty(party: string): string {
  return PARTY_LABELS.get(bucketKeyFor(party)) ?? party;
}

interface MicrositePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { category: string; slug: string }[] {
  return MICROSITES.map((microsite) => ({
    category: categorySlugFor(microsite),
    slug: microsite.slug,
  }));
}

export async function generateMetadata({ params }: MicrositePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  if (microsite === undefined || categorySlugFor(microsite) !== category) {
    return { title: 'nz-data-lab' };
  }
  const path = micrositePathFor(microsite);
  return {
    title: `${microsite.label} - nz-data-lab`,
    description: microsite.description,
    openGraph: {
      title: `${microsite.label} - nz-data-lab`,
      description: microsite.description,
      url: path,
      type: 'article',
    },
  };
}

export default async function MicrositePage({
  params,
}: MicrositePageProps): Promise<React.ReactElement> {
  const { category, slug } = await params;
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  if (microsite === undefined || categorySlugFor(microsite) !== category) {
    notFound();
  }

  const related = relatedMicrositesFor(microsite).map((candidate) => ({
    label: candidate.label,
    href: micrositePathFor(candidate),
  }));

  const content = await renderStoryContent(slug, microsite.dataNote);

  return (
    <>
      <Container size="wide">
        <nav aria-label="Breadcrumb" className="py-[var(--spacing-2xl)]">
          <ol className="numeral-paragraph-sm flex flex-wrap items-center gap-2 text-[var(--color-muted)]">
            <li>
              <Link href="/" className="underline hover:text-[var(--color-fg)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/${categorySlugFor(microsite)}/`}
                className="underline hover:text-[var(--color-fg)]"
              >
                {microsite.category}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--color-fg)]">
              {microsite.label}
            </li>
          </ol>
        </nav>
      </Container>
      <MicrositeStory
        id={microsite.slug}
        eyebrow={microsite.eyebrow}
        title={microsite.title}
        description={microsite.description}
        paragraphs={microsite.paragraphs}
        keyFacts={microsite.keyFacts}
        howToRead={microsite.howToRead}
        sourceUrl={microsite.sourceUrl}
        updatedLabel={freshnessLabelFor(microsite)}
        related={related}
        accent={microsite.accent}
        chart={content.chart}
        stats={content.stats}
        dataNote={content.dataNote}
        references={microsite.references}
      />
      <ReportIssueButton pageLabel={microsite.label} />
    </>
  );
}

interface StoryContent {
  chart: React.ReactNode;
  stats: React.ReactNode;
  /** Source note for the footer, defaulting to the microsite config's own. */
  dataNote: string;
}

/**
 * Builds the chart, stats, and source note for one story. Each story fetches
 * only the data it draws, so a story page never depends on another story's
 * upstream API.
 * @param slug - microsite slug
 * @param dataNote - the microsite config's source note
 */
async function renderStoryContent(slug: string, dataNote: string): Promise<StoryContent> {
  switch (slug) {
    case 'sheep-index': {
      const sheep = await fetchSheepSeries(env.STATS_NZ_SUBSCRIPTION_KEY);
      return {
        chart: <SheepChart points={sheep.points} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label={`Sheep right now (${sheep.latest.year})`}
              value={formatMillionsSheep(sheep.latest.sheep)}
              accent="amber"
              testId="sheep-latest"
              dataValue={sheep.latest.sheep}
            />
            <StatCard
              label={`Peak flock (${sheep.peak.year})`}
              value={formatMillionsSheep(sheep.peak.sheep)}
              accent="amber"
            />
            <StatCard
              label="Change since peak"
              value={`${Math.round(sheep.changeFromPeakPercent)}%`}
              accent="amber"
              testId="sheep-change"
              dataValue={Math.round(sheep.changeFromPeakPercent)}
            />
          </dl>
        ),
        dataNote,
      };
    }
    case 'parliament-party-seats': {
      const { rows, source } = await fetchParliamentPartySeats();
      const shownRows = rows.filter((row) => row.parliament >= FIRST_TWO_PARTY_PARLIAMENT);
      const latest = shownRows.at(-1);
      return {
        chart: (
          <div>
            <GovernmentPartyChart rows={shownRows} />
            <div className="mt-16">
              <h2 className="numeral-heading-2xl">Share of the house, and who held the top job.</h2>
              <p className="numeral-paragraph-md mt-2 max-w-3xl text-[var(--color-muted)]">
                The same seats as a share of the House, so the parties stay comparable as it grew.
                Time runs left to right, and the top band overlays the prime minister of each era.
              </p>
              <div className="mt-6">
                <GovernmentSeatShareChart rows={shownRows} />
              </div>
            </div>
          </div>
        ),
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Elections shown"
              value={String(shownRows.length)}
              accent="teal"
              testId="parliament-elections"
              dataValue={shownRows.length}
            />
            <StatCard
              label={`Largest party at the ${latest === undefined ? 'latest' : String(latest.electionYear)} election`}
              value={latest === undefined ? '—' : bucketLabelForParty(latest.largestParty)}
              accent="teal"
            />
            <StatCard
              label="Government changes"
              value={String(GOVERNMENT_CHANGE_EVENTS.length)}
              accent="teal"
              testId="parliament-changes"
              dataValue={GOVERNMENT_CHANGE_EVENTS.length}
            />
          </dl>
        ),
        dataNote: `${dataNote} ${SOURCE_SENTENCE[source]}`,
      };
    }
    default:
      return { chart: null, stats: null, dataNote };
  }
}
