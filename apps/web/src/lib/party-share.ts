import type { ParliamentPartyRow } from '@/lib/government-data';
import { bucketKeyFor, PARTY_BUCKETS } from '@/lib/party-buckets';

/** One parliament row with a bucket column per party, values in percent. */
export interface PartyShareRow {
  year: number;
  labour: number;
  national: number;
  green: number;
  nzFirst: number;
  act: number;
  other: number;
}

function emptyShareRow(year: number): PartyShareRow {
  return { year, labour: 0, national: 0, green: 0, nzFirst: 0, act: 0, other: 0 };
}

function addSeats(row: PartyShareRow, party: string, seats: number): PartyShareRow {
  const key = bucketKeyFor(party);
  return { ...row, [key]: row[key] + seats };
}

/**
 * Converts per-parliament seat counts into percent-of-seats per party, so
 * any chart can render power share over time without repeating the bucket
 * logic. Values sum to 100 within rounding.
 * @param rows
 */
export function toPartyShareRows(rows: ParliamentPartyRow[]): PartyShareRow[] {
  return rows.map((row) => {
    const counts = row.parties.reduce(
      (share, party) => addSeats(share, party.party, party.seats),
      emptyShareRow(row.electionYear),
    );
    const total = PARTY_BUCKETS.reduce((sum, bucket) => sum + counts[bucket.key], 0) + counts.other;
    const scaled: PartyShareRow = { ...counts };
    for (const bucket of PARTY_BUCKETS) {
      scaled[bucket.key] = total === 0 ? 0 : (counts[bucket.key] / total) * 100;
    }
    scaled.other = total === 0 ? 0 : (counts.other / total) * 100;
    return scaled;
  });
}

/**
 * Formats a share value as a percentage with one decimal place.
 * @param value
 */
export function formatShare(value: number | string | undefined): string {
  return typeof value === 'number' ? `${value.toFixed(1)}%` : '—';
}
