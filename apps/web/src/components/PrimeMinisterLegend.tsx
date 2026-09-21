'use client';

import { PRIME_MINISTERS } from '@/lib/government-pms';
import { PARTY_BUCKETS } from '@/lib/party-buckets';

const PARTY_LABEL = new Map(PARTY_BUCKETS.map((bucket) => [bucket.key, bucket.label]));
const COLOR_BY_PARTY = new Map(PARTY_BUCKETS.map((bucket) => [bucket.key, bucket.color]));

/**
 * Numbered list of every prime minister since 1984, with party colour dot,
 * the years they held the job, and a citation. Pairs with the bands drawn
 * by PrimeMinisterBand.
 * @param root0
 * @param root0.heading
 */
export function PrimeMinisterLegend({
  heading = 'Prime ministers on this chart',
}: {
  heading?: string;
}): React.ReactElement {
  return (
    <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4">
      <p className="numeral-text-eyebrow text-[var(--color-muted)]">{heading}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        {PRIME_MINISTERS.map((pm) => (
          <li key={pm.name} className="numeral-paragraph-sm text-[var(--color-muted)]">
            <span
              className="mr-1.5 inline-block size-2.5 rounded-full"
              style={{ backgroundColor: COLOR_BY_PARTY.get(pm.party) }}
              aria-hidden="true"
            />
            <span className="text-[var(--color-fg)]">
              {pm.name}, {PARTY_LABEL.get(pm.party)}
            </span>{' '}
            — {pm.fromYear}–{pm.toYear ?? 'present'}. {pm.citation}
          </li>
        ))}
      </ol>
    </div>
  );
}
