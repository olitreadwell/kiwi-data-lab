import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  parsePartySeats,
  parsePartySeatsFixture,
  summarizeGovernmentData,
} from './government-data';
import { GOVERNMENT_CHANGE_EVENTS } from './government-events';

const FIXTURE = JSON.parse(
  readFileSync(path.join(process.cwd(), 'src/lib/fixtures/mp-party-seats.json'), 'utf8'),
) as unknown;

describe('parsePartySeats', () => {
  it('counts seats per party from raw MP term rows', () => {
    const rows = parsePartySeats([
      { Parliament: 54, Party: 'New Zealand National Party', Date_Elected: '2023-10-14T00:00:00' },
      { Parliament: 54, Party: 'New Zealand National Party', Date_Elected: '2023-10-14T00:00:00' },
      { Parliament: 54, Party: 'New Zealand Labour Party', Date_Elected: '2023-10-14T00:00:00' },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.electionYear).toBe(2023);
    expect(rows[0]?.largestParty).toContain('National');
    expect(rows[0]?.largestSeats).toBe(2);
  });

  it('parses the aggregated fixture', () => {
    const rows = parsePartySeatsFixture(FIXTURE);
    expect(rows.length).toBeGreaterThan(50);
    const latest = rows[rows.length - 1];
    expect(latest?.parliament).toBe(54);
    expect(latest?.largestParty).toContain('National');
  });
});

describe('GOVERNMENT_CHANGE_EVENTS', () => {
  it('marks the six party changes since 1984', () => {
    expect(GOVERNMENT_CHANGE_EVENTS.map((event) => event.x)).toEqual([
      1984, 1990, 1999, 2008, 2017, 2023,
    ]);
    for (const event of GOVERNMENT_CHANGE_EVENTS) {
      expect(event.label.length).toBeGreaterThan(0);
      expect(event.citation.length).toBeGreaterThan(20);
    }
  });
});

describe('summarizeGovernmentData', () => {
  it('reports the number of parliaments', () => {
    const summary = summarizeGovernmentData(parsePartySeatsFixture(FIXTURE));
    expect(summary.parliaments).toBeGreaterThan(50);
    expect(summary.recent?.parliament).toBe(54);
  });
});
