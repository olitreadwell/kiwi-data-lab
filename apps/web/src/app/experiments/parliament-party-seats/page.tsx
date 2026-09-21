import { Container, Section, Stack } from '@nzlab/ui';

import { GovernmentPartyChart } from '@/components/GovernmentPartyChart';
import { GovernmentSeatShareChart } from '@/components/GovernmentSeatShareChart';
import { fetchParliamentPartySeats, GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-data';

/** First parliament of the modern era shown on the page. */
const FIRST_MODERN_PARLIAMENT = 41;

export default async function ParliamentPartySeatsPage(): Promise<React.ReactElement> {
  const rows = await fetchParliamentPartySeats();
  const modern = rows.filter((row) => row.parliament >= FIRST_MODERN_PARLIAMENT);
  const latest = modern[modern.length - 1];

  const stats = [
    { label: 'Elections shown', value: String(modern.length) },
    { label: 'Largest party in 2023', value: latest?.largestParty ?? '—' },
    { label: 'Government changes', value: String(GOVERNMENT_CHANGE_EVENTS.length) },
  ];

  return (
    <Section>
      <Container>
        <Stack className="max-w-3xl gap-4">
          <p className="numeral-text-eyebrow text-[var(--color-muted)]">
            experiments / parliament-party-seats
          </p>
          <h1 className="numeral-heading-3xl">
            Which party held the most seats, election by election.
          </h1>
          <p className="numeral-paragraph-lg text-[var(--color-muted)]">
            Each bar is one election year from 1984 to 2023. The colours are the parties, and taller
            means more seats. The flags mark the years the government changed. The seats come from
            the Parliament website Member Terms list, served through the data.govt.nz datastore.
          </p>
        </Stack>

        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6"
            >
              <dt className="numeral-text-eyebrow text-[var(--color-muted)]">{stat.label}</dt>
              <dd className="numeral-heading-2xl mt-2">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">
          <GovernmentPartyChart rows={modern} />
        </div>

        <div className="mt-16">
          <h2 className="numeral-heading-2xl">Share of the house, and who held the top job.</h2>
          <p className="numeral-paragraph-md mt-2 max-w-3xl text-[var(--color-muted)]">
            Same election data, rescaled to percentage of seats so the parties are comparable across
            changing house sizes. Time runs left to right; the top band overlays the prime minister
            of each era.
          </p>
          <div className="mt-6">
            <GovernmentSeatShareChart rows={modern} />
          </div>
        </div>

        <p className="numeral-text-sm mt-12 max-w-3xl text-[var(--color-muted)]">
          Data: New Zealand Parliament, Members of Parliament Member Terms, via the data.govt.nz
          CKAN datastore (resource 9767376e). The largest party is not always the governing party:
          in 1996 and 2017 the largest party stayed out of power, so the government-change flags are
          curated from election results, not just the seat counts.
        </p>
      </Container>
    </Section>
  );
}
