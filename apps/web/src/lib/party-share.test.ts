import { describe, expect, it } from 'vitest';

import type { ParliamentPartyRow } from './government-data';
import { formatShare, toPartyShareRows } from './party-share';

const ROWS: ParliamentPartyRow[] = [
  {
    parliament: 52,
    electionYear: 2017,
    largestParty: 'New Zealand National Party',
    largestSeats: 56,
    parties: [
      { party: 'New Zealand National Party', seats: 56 },
      { party: 'New Zealand Labour Party', seats: 46 },
      { party: 'New Zealand First Party', seats: 9 },
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
      { party: 'Green Party of Aotearoa New Zealand', seats: 15 },
      { party: 'ACT New Zealand', seats: 11 },
      { party: 'Independent', seats: 1 },
    ],
  },
];

describe('toPartyShareRows', () => {
  it('keeps one row per parliament with the election year', () => {
    const rows = toPartyShareRows(ROWS);
    expect(rows.map((row) => row.year)).toEqual([2017, 2023]);
  });

  it('converts seats into percent of the house per bucket', () => {
    const [first] = toPartyShareRows(ROWS);
    expect(first?.labour).toBeCloseTo((46 / 111) * 100);
    expect(first?.national).toBeCloseTo((56 / 111) * 100);
    expect(first?.nzFirst).toBeCloseTo((9 / 111) * 100);
    expect(first?.green).toBe(0);
    expect(first?.act).toBe(0);
  });

  it('buckets every party name, including independents into other', () => {
    const [, last] = toPartyShareRows(ROWS);
    expect(last?.green).toBeCloseTo((15 / 109) * 100);
    expect(last?.act).toBeCloseTo((11 / 109) * 100);
    expect(last?.other).toBeCloseTo((1 / 109) * 100);
  });

  it('sums each row to 100 per cent within rounding', () => {
    for (const row of toPartyShareRows(ROWS)) {
      const total = row.labour + row.national + row.green + row.nzFirst + row.act + row.other;
      expect(total).toBeCloseTo(100);
    }
  });

  it('returns zero shares for a row with no seats', () => {
    const rows = toPartyShareRows([
      {
        parliament: 1,
        electionYear: 1853,
        largestParty: 'Nobody',
        largestSeats: 0,
        parties: [],
      },
    ]);
    expect(rows[0]).toEqual({
      year: 1853,
      labour: 0,
      national: 0,
      green: 0,
      nzFirst: 0,
      act: 0,
      other: 0,
    });
  });
});

describe('formatShare', () => {
  it('formats a number with one decimal place and a percent sign', () => {
    expect(formatShare(43.9)).toBe('43.9%');
    expect(formatShare(0)).toBe('0.0%');
  });

  it('returns an em dash for missing values', () => {
    expect(formatShare(undefined)).toBe('—');
    expect(formatShare('n/a')).toBe('—');
  });
});
