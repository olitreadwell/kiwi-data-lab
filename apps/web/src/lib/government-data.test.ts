import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  electionYearRangeLabelFor,
  PARLIAMENT_DATASTORE_FIELDS,
  ParliamentSeatDataError,
  parsePartySeats,
  summarizeGovernmentData,
} from './government-data';
import { GOVERNMENT_CHANGE_EVENTS } from './government-events';

const SNAPSHOT = JSON.parse(
  readFileSync(path.join(process.cwd(), 'src/lib/fixtures/mp-member-terms.json'), 'utf8'),
) as Record<string, unknown>[];

/** Parliament number the page starts its window at (1935, the first Labour government). */
const FIRST_SHOWN_PARLIAMENT = 25;

/** One Member Terms row, shaped like the datastore payload. */
function term(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    MemberID: 1,
    Parliament: 54,
    Party: 'New Zealand National Party',
    Date_Elected: '2023-10-14T00:00:00',
    Method_of_Election: 'General election',
    ...overrides,
  };
}

describe('parsePartySeats', () => {
  it('counts one seat per member elected at the general election', () => {
    const rows = parsePartySeats([
      term({ MemberID: 1 }),
      term({ MemberID: 2 }),
      term({ MemberID: 3, Party: 'New Zealand Labour Party' }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.electionYear).toBe(2023);
    expect(rows[0]?.largestParty).toContain('National');
    expect(rows[0]?.largestSeats).toBe(2);
    expect(rows[0]?.parties).toContainEqual({ party: 'New Zealand Labour Party', seats: 1 });
  });

  it('ignores by-elections and later rows for a member who already holds a seat', () => {
    const rows = parsePartySeats([
      term({ MemberID: 7, Parliament: 44, Date_Elected: '1993-06-11T00:00:00' }),
      term({
        MemberID: 7,
        Parliament: 44,
        Date_Elected: '1995-06-28T00:00:00',
        Party: 'United New Zealand',
      }),
      term({
        MemberID: 8,
        Parliament: 44,
        Date_Elected: '1993-06-11T00:00:00',
        Party: 'New Zealand Labour Party',
      }),
      term({
        MemberID: 9,
        Parliament: 44,
        Date_Elected: '1994-08-13T00:00:00',
        Party: 'Alliance',
        Method_of_Election: 'By-election',
      }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.electionYear).toBe(1993);
    expect(rows[0]?.largestSeats).toBe(1);
    expect(rows[0]?.parties).toHaveLength(2);
    expect(rows[0]?.parties.map((party) => party.party)).not.toContain('Alliance');
    expect(rows[0]?.parties.map((party) => party.party)).not.toContain('United New Zealand');
  });

  it('throws rather than reporting year zero when Date_Elected is missing', () => {
    expect(() => parsePartySeats([term({ Date_Elected: undefined })])).toThrow(
      ParliamentSeatDataError,
    );
  });

  it('throws when the payload holds no general-election rows', () => {
    expect(() => parsePartySeats([term({ Method_of_Election: 'By-election' })])).toThrow(
      ParliamentSeatDataError,
    );
  });
});

describe('committed Member Terms snapshot', () => {
  const rows = parsePartySeats(SNAPSHOT);

  it('holds only the fields the parser reads', () => {
    const fields = new Set<string>(PARLIAMENT_DATASTORE_FIELDS);
    for (const row of SNAPSHOT) {
      expect(Object.keys(row).every((key) => fields.has(key))).toBe(true);
    }
  });

  it('gives every parliament a real election year', () => {
    expect(rows).toHaveLength(54);
    expect(rows.map((row) => row.electionYear)).toEqual(
      [...rows.map((row) => row.electionYear)].sort((a, b) => a - b),
    );
    for (const row of rows) {
      expect(row.electionYear).toBeGreaterThanOrEqual(1853);
      expect(row.electionYear).toBeLessThanOrEqual(new Date().getFullYear());
    }
    expect(rows.find((row) => row.parliament === 1)?.electionYear).toBe(1853);
    expect(rows.find((row) => row.parliament === 25)?.electionYear).toBe(1935);
    expect(rows.find((row) => row.parliament === 41)?.electionYear).toBe(1984);
    expect(rows.find((row) => row.parliament === 54)?.electionYear).toBe(2023);
  });

  it('counts the seats each parliament actually had', () => {
    const seatsIn = (parliament: number): number => {
      const row = rows.find((candidate) => candidate.parliament === parliament);
      return row?.parties.reduce((sum, party) => sum + party.seats, 0) ?? 0;
    };
    // House sizes: 95 seats in 1984, 99 in 1993, then 120 from 1996 under MMP.
    expect(seatsIn(41)).toBe(95);
    expect(seatsIn(44)).toBe(99);
    expect(seatsIn(45)).toBe(120);
    expect(seatsIn(54)).toBe(122);
  });

  it('names the largest party in the latest parliament', () => {
    const latest = rows.at(-1);
    expect(latest?.parliament).toBe(54);
    expect(latest?.largestParty).toContain('National');
    expect(latest?.largestSeats).toBe(48);
  });
});

describe('electionYearRangeLabelFor', () => {
  it('labels the window the page shows', () => {
    const shown = parsePartySeats(SNAPSHOT).filter(
      (row) => row.parliament >= FIRST_SHOWN_PARLIAMENT,
    );
    expect(electionYearRangeLabelFor(shown)).toBe('1935 to 2023');
  });

  it('collapses a single election to its year', () => {
    expect(
      electionYearRangeLabelFor([
        {
          parliament: 41,
          electionYear: 1984,
          largestParty: 'New Zealand Labour Party',
          largestSeats: 56,
          parties: [{ party: 'New Zealand Labour Party', seats: 56 }],
        },
      ]),
    ).toBe('1984');
  });

  it('says so when there are no rows', () => {
    expect(electionYearRangeLabelFor([])).toBe('no elections');
  });
});

describe('GOVERNMENT_CHANGE_EVENTS', () => {
  it('marks every change of governing party since 1935', () => {
    expect(GOVERNMENT_CHANGE_EVENTS.map((event) => event.x)).toEqual([
      1935, 1949, 1957, 1960, 1972, 1975, 1984, 1990, 1999, 2008, 2017, 2023,
    ]);
    for (const event of GOVERNMENT_CHANGE_EVENTS) {
      expect(event.label.length).toBeGreaterThan(0);
      expect(event.citation.length).toBeGreaterThan(20);
    }
  });
});

describe('summarizeGovernmentData', () => {
  it('reports the number of parliaments', () => {
    const summary = summarizeGovernmentData(parsePartySeats(SNAPSHOT));
    expect(summary.parliaments).toBe(54);
    expect(summary.recent?.parliament).toBe(54);
  });
});
