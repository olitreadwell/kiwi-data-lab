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
