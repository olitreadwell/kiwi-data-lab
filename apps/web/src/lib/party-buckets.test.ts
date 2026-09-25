import { describe, expect, it } from 'vitest';

import type { ElectionPartySeats, PartyBucketKey } from './party-buckets';
import { partyBucketsBySizeFor } from './party-buckets';

/** Datastore party names, as the bucketing sees them. */
const PARTY_NAME: Record<PartyBucketKey, string> = {
  labour: 'New Zealand Labour Party',
  national: 'New Zealand National Party',
  green: 'Green Party of Aotearoa / New Zealand',
  nzFirst: 'New Zealand First Party',
  act: 'ACT New Zealand',
  other: 'Māori Party',
};

/** Election rows from a bucket-key to seat map, for stack-order tests. */
function rowsFrom(seats: Partial<Record<PartyBucketKey, number>>): ElectionPartySeats[] {
  const parties = Object.entries(seats).map(([key, count]) => ({
    party: PARTY_NAME[key as PartyBucketKey],
    seats: count ?? 0,
  }));
  return [{ parties }];
}

describe('partyBucketsBySizeFor', () => {
  it('orders the smallest party first, so the biggest ends up on top', () => {
    const order = partyBucketsBySizeFor(
      rowsFrom({ labour: 50, national: 60, green: 10, nzFirst: 5, act: 2 }),
    );
    expect(order.map((bucket) => bucket.label)).toEqual([
      'ACT',
      'NZ First',
      'Green',
      'Labour',
      'National',
    ]);
  });

  it('adds seats up across every election in the window', () => {
    const rows: ElectionPartySeats[] = [
      { parties: [{ party: 'New Zealand Labour Party', seats: 40 }] },
      { parties: [{ party: 'New Zealand Labour Party', seats: 45 }] },
      { parties: [{ party: 'Green Party of Aotearoa / New Zealand', seats: 15 }] },
    ];
    const order = partyBucketsBySizeFor(rows);
    expect(order.at(-1)?.label).toBe('Labour');
  });

  it('falls back to the legend order when parties are level', () => {
    const order = partyBucketsBySizeFor(rowsFrom({ labour: 10, national: 10 }));
    const named = order
      .map((bucket) => bucket.label)
      .filter((label) => label === 'Labour' || label === 'National');
    expect(named).toEqual(['Labour', 'National']);
  });
});
