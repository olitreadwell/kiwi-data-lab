import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Seats per party per parliament, from the NZ Parliament "Members of
 * Parliament - Member Terms" table served through the data.govt.nz CKAN
 * datastore (resource 9767376e-ead0-468d-8b55-a65dfb629b54). The resource
 * lists every MP term since 1853. This module counts the terms per party per
 * parliament and names the largest party in each one. The governing party is
 * a separate, curated list of well-documented election results, because the
 * party with the most seats is not always the one in government (1996, 2017).
 */
export { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-events';

export const PARLIAMENT_RESOURCE_ID = '9767376e-ead0-468d-8b55-a65dfb629b54';

export interface PartySeatCount {
  party: string;
  seats: number;
}

export interface ParliamentPartyRow {
  /** Parliament number, 1 to 54. */
  parliament: number;
  /** Year of the election that opened this parliament. */
  electionYear: number;
  largestParty: string;
  largestSeats: number;
  parties: PartySeatCount[];
}

function partySeatsFor(payload: unknown): Map<number, Map<string, number>> {
  const byParliament = new Map<number, Map<string, number>>();
  if (!Array.isArray(payload)) {
    return byParliament;
  }
  for (const raw of payload) {
    if (typeof raw !== 'object' || raw === null) {
      continue;
    }
    const record = raw as Record<string, unknown>;
    const parliament = Number(record.Parliament);
    if (!Number.isInteger(parliament) || parliament < 1) {
      continue;
    }
    const party =
      typeof record.Party === 'string' && record.Party.trim() !== ''
        ? record.Party.trim()
        : 'No party recorded';
    const parties = byParliament.get(parliament) ?? new Map<string, number>();
    parties.set(party, (parties.get(party) ?? 0) + 1);
    byParliament.set(parliament, parties);
  }
  return byParliament;
}

/**
 * Parses raw MP term rows into per-parliament party seat counts, or passes
 * pre-aggregated fixture rows through. The election year is the earliest
 * election date seen in each parliament.
 */
export function parsePartySeats(payload: unknown): ParliamentPartyRow[] {
  if (!Array.isArray(payload)) {
    throw new Error('Expected an array of parliament rows');
  }
  const byParliament = partySeatsFor(payload);
  const electionYears = new Map<number, number>();
  for (const raw of payload) {
    if (typeof raw !== 'object' || raw === null) {
      continue;
    }
    const record = raw as Record<string, unknown>;
    const parliament = Number(record.Parliament);
    const electionDate = record.Date_Elected;
    if (typeof electionDate === 'string' && electionDate.length >= 4) {
      const year = Number(electionDate.slice(0, 4));
      if (Number.isInteger(year) && (electionYears.get(parliament) ?? 9999) > year) {
        electionYears.set(parliament, year);
      }
    }
  }
  const rows: ParliamentPartyRow[] = [];
  for (const [parliament, parties] of byParliament) {
    const partyList = [...parties.entries()]
      .map(([party, seats]) => ({ party, seats }))
      .sort((a, b) => b.seats - a.seats);
    const top = partyList[0];
    rows.push({
      parliament,
      electionYear: electionYears.get(parliament) ?? 0,
      largestParty: top?.party ?? '',
      largestSeats: top?.seats ?? 0,
      parties: partyList,
    });
  }
  rows.sort((a, b) => a.parliament - b.parliament);
  return rows;
}

/** Passes pre-aggregated fixture rows through unchanged. */
export function parsePartySeatsFixture(payload: unknown): ParliamentPartyRow[] {
  if (!Array.isArray(payload)) {
    throw new Error('Expected an array of parliament rows');
  }
  const rows: ParliamentPartyRow[] = [];
  for (const raw of payload) {
    if (typeof raw !== 'object' || raw === null) {
      continue;
    }
    const record = raw as Record<string, unknown>;
    if (typeof record.parliament !== 'number' || !Array.isArray(record.parties)) {
      continue;
    }
    rows.push({
      parliament: record.parliament,
      electionYear: typeof record.electionYear === 'number' ? record.electionYear : 0,
      largestParty: typeof record.largestParty === 'string' ? record.largestParty : '',
      largestSeats: Number(record.largestSeats ?? 0),
      parties: record.parties.map((party) => {
        const p = party as Record<string, unknown>;
        return { party: typeof p.party === 'string' ? p.party : '', seats: Number(p.seats ?? 0) };
      }),
    });
  }
  rows.sort((a, b) => a.parliament - b.parliament);
  return rows;
}

/** Headline facts for the page. */
export function summarizeGovernmentData(rows: ParliamentPartyRow[]): {
  parliaments: number;
  recent: ParliamentPartyRow | undefined;
} {
  return { parliaments: rows.length, recent: rows[rows.length - 1] };
}

const PARLIAMENT_FIXTURE_PATH = path.join(process.cwd(), 'src/lib/fixtures/mp-party-seats.json');

/** Fetches MP term rows live, falling back to the committed fixture. */
export async function fetchParliamentPartySeats(
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
): Promise<ParliamentPartyRow[]> {
  try {
    const raw: unknown[] = [];
    let offset = 0;
    for (;;) {
      const url =
        `https://catalogue.data.govt.nz/api/3/action/datastore_search` +
        `?resource_id=${PARLIAMENT_RESOURCE_ID}&limit=5000&offset=${offset}` +
        `&fields=${encodeURIComponent('Parliament,Party,Date_Elected')}`;
      const response = await fetchImpl(url, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`data.govt.nz HTTP ${response.status}`);
      }
      const payload = (await response.json()) as {
        result?: { records?: unknown[]; total?: number };
      };
      const records = payload.result?.records ?? [];
      raw.push(...records);
      const total = payload.result?.total ?? 0;
      if (raw.length >= total || records.length === 0) {
        break;
      }
      offset = raw.length;
    }
    return parsePartySeats(raw);
  } catch {
    const fixture = JSON.parse(readFileSync(PARLIAMENT_FIXTURE_PATH, 'utf8')) as unknown;
    return parsePartySeatsFixture(fixture);
  }
}
