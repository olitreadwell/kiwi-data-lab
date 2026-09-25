import type { PartySeatCount } from '@/lib/government-data';

/** Bucket key a Member Terms party name maps to. */
export type PartyBucketKey = 'labour' | 'national' | 'green' | 'nzFirst' | 'act' | 'other';

/** One chart bucket per major party; the rest of the seats are "Other". */
export interface PartyBucket {
  label: string;
  key: PartyBucketKey;
  color: string;
}

export const PARTY_BUCKETS: PartyBucket[] = [
  { label: 'Labour', key: 'labour', color: '#D55E00' },
  { label: 'National', key: 'national', color: '#0072B2' },
  { label: 'Green', key: 'green', color: '#009E73' },
  { label: 'NZ First', key: 'nzFirst', color: '#E69F00' },
  { label: 'ACT', key: 'act', color: '#CC79A7' },
];

/**
 * Maps a Member Terms party name to a chart bucket key.
 * @param party
 */
export function bucketKeyFor(party: string): PartyBucketKey {
  if (party.includes('Labour')) return 'labour';
  if (party.includes('National')) return 'national';
  if (party.includes('Green')) return 'green';
  if (party.includes('First')) return 'nzFirst';
  if (party.includes('ACT')) return 'act';
  return 'other';
}

/** One election's parties, as much as the stack order needs. */
export interface ElectionPartySeats {
  parties: PartySeatCount[];
}

/**
 * Chart buckets ordered for stacking, smallest party first, so the biggest
 * parties end up against the top of the chart: the top block of a stack is
 * bounded by the total, which makes it the easiest one to read. Ties keep the
 * legend order.
 * @param rows - one entry per election in the chart window
 */
export function partyBucketsBySizeFor(rows: ElectionPartySeats[]): PartyBucket[] {
  const seatsByBucket = new Map<PartyBucketKey, number>();
  for (const row of rows) {
    for (const party of row.parties) {
      const key = bucketKeyFor(party.party);
      seatsByBucket.set(key, (seatsByBucket.get(key) ?? 0) + party.seats);
    }
  }
  return [...PARTY_BUCKETS].sort(
    (first, second) => (seatsByBucket.get(first.key) ?? 0) - (seatsByBucket.get(second.key) ?? 0),
  );
}
