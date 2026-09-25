/**
 * Seats per party per parliament, from the NZ Parliament "Members of
 * Parliament - Member Terms" table served through the data.govt.nz CKAN
 * datastore (resource 9767376e-ead0-468d-8b55-a65dfb629b54).
 *
 * The resource lists every MP term since 1853, including by-elections, list
 * replacements and mid-term changes of affiliation, so a seat is counted
 * once per member who was elected at that parliament's general election
 * (Method_of_Election = "General election", deduplicated by MemberID).
 * Counting every term instead inflates the totals: it puts 143 members in
 * the 1996 parliament, which had 120 seats.
 *
 * The governing party is a separate, curated list of well-documented
 * election results, because the party with the most seats is not always the
 * one in government: in 2017 National won 56 seats and Labour formed the
 * government.
 *
 * Client-safe: charts import the row types and label helpers from here, so
 * this module must not import node built-ins. Fetching lives in
 * `@/lib/parliament-datastore`.
 */
export { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-events';

export const PARLIAMENT_RESOURCE_ID = '9767376e-ead0-468d-8b55-a65dfb629b54';

/** Datastore fields the seat parser reads; the snapshot fixture holds the same ones. */
export const PARLIAMENT_DATASTORE_FIELDS = [
  'MemberID',
  'Parliament',
  'Party',
  'Date_Elected',
  'Method_of_Election',
] as const;

/** Method_of_Election value that marks a member elected at the general election. */
const GENERAL_ELECTION_METHOD = 'General election';

/** Year the first New Zealand Parliament was elected; earlier years are a parsing bug. */
const FIRST_PARLIAMENT_YEAR = 1853;

/** Party label for a term the datastore leaves blank. */
const UNRECORDED_PARTY = 'No party recorded';

/** Thrown when the datastore payload cannot be turned into seat rows. */
export class ParliamentSeatDataError extends Error {}

export interface PartySeatCount {
  party: string;
  seats: number;
}

export interface ParliamentPartyRow {
  /** Parliament number, 1 to 54. */
  parliament: number;
  /** Year of the general election that opened this parliament. */
  electionYear: number;
  largestParty: string;
  largestSeats: number;
  parties: PartySeatCount[];
}

/** Where the seat rows were read from, so the page can say which one it used. */
export type ParliamentSeatSource = 'datastore' | 'snapshot';

export interface ParliamentSeatResult {
  rows: ParliamentPartyRow[];
  source: ParliamentSeatSource;
}

/** One general-election seat, as counted from a Member Terms row. */
interface SeatTerm {
  party: string;
  year: number;
}

function electionYearFor(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.length < 4) {
    return undefined;
  }
  const year = Number(value.slice(0, 4));
  return Number.isInteger(year) ? year : undefined;
}

function partyLabelFor(value: unknown): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : UNRECORDED_PARTY;
}

function memberKeyFor(record: Record<string, unknown>, rowIndex: number): string {
  const memberId = record.MemberID;
  if (typeof memberId === 'number' || (typeof memberId === 'string' && memberId !== '')) {
    return String(memberId);
  }
  return `row-${String(rowIndex)}`;
}

/**
 * Groups general-election terms by parliament and member, keeping the
 * earliest row for each member. A member can hold more than one row in a
 * parliament (a later change of affiliation is sometimes recorded against a
 * general-election row), and the earliest row is the one that won the seat.
 */
function seatTermsByParliament(payload: unknown): Map<number, Map<string, SeatTerm>> {
  if (!Array.isArray(payload)) {
    throw new ParliamentSeatDataError('Expected an array of MP term rows');
  }
  const byParliament = new Map<number, Map<string, SeatTerm>>();
  payload.forEach((raw, rowIndex) => {
    if (typeof raw !== 'object' || raw === null) {
      return;
    }
    const record = raw as Record<string, unknown>;
    if (record.Method_of_Election !== GENERAL_ELECTION_METHOD) {
      return;
    }
    const parliament = Number(record.Parliament);
    if (!Number.isInteger(parliament) || parliament < 1) {
      return;
    }
    const year = electionYearFor(record.Date_Elected);
    if (year === undefined) {
      return;
    }
    const memberKey = memberKeyFor(record, rowIndex);
    const terms = byParliament.get(parliament) ?? new Map<string, SeatTerm>();
    const existing = terms.get(memberKey);
    if (existing === undefined || year < existing.year) {
      terms.set(memberKey, { party: partyLabelFor(record.Party), year });
    }
    byParliament.set(parliament, terms);
  });
  return byParliament;
}

function assertPlausibleElectionYear(parliament: number, year: number): void {
  const latestPlausibleYear = new Date().getFullYear() + 1;
  if (year < FIRST_PARLIAMENT_YEAR || year > latestPlausibleYear) {
    throw new ParliamentSeatDataError(
      `Parliament ${String(parliament)} has an implausible election year: ${String(year)}`,
    );
  }
}

/**
 * Parses MP term rows into per-parliament seat counts. Accepts either the
 * live datastore payload or the committed snapshot, which holds the same
 * fields, so both paths share one set of counting rules.
 */
export function parsePartySeats(payload: unknown): ParliamentPartyRow[] {
  const byParliament = seatTermsByParliament(payload);
  const rows: ParliamentPartyRow[] = [];
  for (const [parliament, terms] of byParliament) {
    const seatsByParty = new Map<string, number>();
    let electionYear = Number.POSITIVE_INFINITY;
    for (const term of terms.values()) {
      seatsByParty.set(term.party, (seatsByParty.get(term.party) ?? 0) + 1);
      electionYear = Math.min(electionYear, term.year);
    }
    assertPlausibleElectionYear(parliament, electionYear);
    const partyList = [...seatsByParty.entries()]
      .map(([party, seats]) => ({ party, seats }))
      .sort((a, b) => b.seats - a.seats);
    const top = partyList[0];
    rows.push({
      parliament,
      electionYear,
      largestParty: top?.party ?? '',
      largestSeats: top?.seats ?? 0,
      parties: partyList,
    });
  }
  rows.sort((a, b) => a.parliament - b.parliament);
  if (rows.length === 0) {
    throw new ParliamentSeatDataError('No general-election rows found in the payload');
  }
  return rows;
}

/** First and last election year in a row set, for chart labels. */
export function electionYearRangeFor(
  rows: ParliamentPartyRow[],
): { firstYear: number; lastYear: number } | undefined {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (first === undefined || last === undefined) {
    return undefined;
  }
  return { firstYear: first.electionYear, lastYear: last.electionYear };
}

/**
 * Chart-label phrase for the election years in a row set, e.g. "1935 to
 * 2023". Derived from the rows so a change to the window cannot leave stale
 * years in a heading, an aria-label or a data table caption.
 * @param rows
 */
export function electionYearRangeLabelFor(rows: ParliamentPartyRow[]): string {
  const range = electionYearRangeFor(rows);
  if (range === undefined) {
    return 'no elections';
  }
  if (range.firstYear === range.lastYear) {
    return String(range.firstYear);
  }
  return `${String(range.firstYear)} to ${String(range.lastYear)}`;
}

/** Headline facts for the page. */
export function summarizeGovernmentData(rows: ParliamentPartyRow[]): {
  parliaments: number;
  recent: ParliamentPartyRow | undefined;
} {
  return { parliaments: rows.length, recent: rows[rows.length - 1] };
}
