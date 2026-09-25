import type { PartyBucketKey } from '@/lib/party-buckets';

/**
 * New Zealand prime ministers since 1935, curated as pinned facts (same
 * status as GOVERNMENT_CHANGE_EVENTS): the governing party is not always
 * the largest party, and who held the top job is a documented fact, not a
 * derivation. Client-safe so charts can use it.
 */

/** One prime ministerial term since 1935. */
export interface PrimeMinisterPeriod {
  name: string;
  /** Charts bucket for the PM's party; Labour and National have both held it. */
  party: Exclude<PartyBucketKey, 'green' | 'nzFirst' | 'act' | 'other'>;
  /** Calendar year the person took office. */
  fromYear: number;
  /** First calendar year they no longer held the job; null means still in office. */
  toYear: number | null;
  /** Where the change is documented. */
  citation: string;
}

/** Prime ministers since 1935, oldest first and contiguous by calendar year. */
export const PRIME_MINISTERS: PrimeMinisterPeriod[] = [
  {
    name: 'Michael Joseph Savage',
    party: 'labour',
    fromYear: 1935,
    toYear: 1940,
    citation:
      'Michael Joseph Savage was sworn in on 6 December 1935 after Labour won the 27 November 1935 election, and died in office on 27 March 1940.',
  },
  {
    name: 'Peter Fraser',
    party: 'labour',
    fromYear: 1940,
    toYear: 1949,
    citation: 'Peter Fraser took over as prime minister on 1 April 1940, after Savage died.',
  },
  {
    name: 'Sidney Holland',
    party: 'national',
    fromYear: 1949,
    toYear: 1957,
    citation:
      'Sidney Holland was sworn in on 13 December 1949 after National won the 30 November 1949 election, and resigned on 20 September 1957.',
  },
  {
    name: 'Keith Holyoake',
    party: 'national',
    fromYear: 1957,
    toYear: 1957,
    citation:
      'Keith Holyoake became prime minister on 20 September 1957, then lost the 30 November 1957 election.',
  },
  {
    name: 'Walter Nash',
    party: 'labour',
    fromYear: 1957,
    toYear: 1960,
    citation:
      'Walter Nash became prime minister on 12 December 1957 after Labour won the 30 November 1957 election.',
  },
  {
    name: 'Keith Holyoake',
    party: 'national',
    fromYear: 1960,
    toYear: 1972,
    citation:
      'Keith Holyoake returned as prime minister on 12 December 1960 and resigned on 7 February 1972.',
  },
  {
    name: 'Jack Marshall',
    party: 'national',
    fromYear: 1972,
    toYear: 1972,
    citation:
      'Jack Marshall became prime minister on 7 February 1972 and lost the 25 November 1972 election.',
  },
  {
    name: 'Norman Kirk',
    party: 'labour',
    fromYear: 1972,
    toYear: 1974,
    citation:
      'Norman Kirk became prime minister on 8 December 1972 after Labour won the 25 November 1972 election, and died in office on 31 August 1974.',
  },
  {
    name: 'Bill Rowling',
    party: 'labour',
    fromYear: 1974,
    toYear: 1975,
    citation: 'Bill Rowling took over as prime minister on 6 September 1974, after Kirk died.',
  },
  {
    name: 'Robert Muldoon',
    party: 'national',
    fromYear: 1975,
    toYear: 1984,
    citation:
      'Robert Muldoon became prime minister on 12 December 1975 after National won the 29 November 1975 election.',
  },
  {
    name: 'David Lange',
    party: 'labour',
    fromYear: 1984,
    toYear: 1989,
    citation:
      'David Lange was sworn in on 26 July 1984 after Labour won the 14 July 1984 election.',
  },
  {
    name: 'Geoffrey Palmer',
    party: 'labour',
    fromYear: 1989,
    toYear: 1990,
    citation: 'Geoffrey Palmer succeeded David Lange on 8 August 1989.',
  },
  {
    name: 'Mike Moore',
    party: 'labour',
    fromYear: 1990,
    toYear: 1990,
    citation:
      'Mike Moore became prime minister on 4 September 1990 and lost the 27 October 1990 election.',
  },
  {
    name: 'Jim Bolger',
    party: 'national',
    fromYear: 1990,
    toYear: 1997,
    citation:
      'Jim Bolger became prime minister on 2 November 1990 after National won the 1990 election.',
  },
  {
    name: 'Jenny Shipley',
    party: 'national',
    fromYear: 1997,
    toYear: 1999,
    citation:
      "Jenny Shipley replaced Jim Bolger on 8 December 1997, New Zealand's first female prime minister.",
  },
  {
    name: 'Helen Clark',
    party: 'labour',
    fromYear: 1999,
    toYear: 2008,
    citation:
      'Helen Clark became prime minister on 10 December 1999 after Labour led the governing coalition.',
  },
  {
    name: 'John Key',
    party: 'national',
    fromYear: 2008,
    toYear: 2016,
    citation:
      'John Key became prime minister on 19 November 2008 after National won the 2008 election.',
  },
  {
    name: 'Bill English',
    party: 'national',
    fromYear: 2016,
    toYear: 2017,
    citation: 'Bill English became prime minister on 12 December 2016 after John Key resigned.',
  },
  {
    name: 'Jacinda Ardern',
    party: 'labour',
    fromYear: 2017,
    toYear: 2023,
    citation:
      'Jacinda Ardern became prime minister on 26 October 2017 after Labour formed government.',
  },
  {
    name: 'Chris Hipkins',
    party: 'labour',
    fromYear: 2023,
    toYear: 2023,
    citation:
      'Chris Hipkins became prime minister on 25 January 2023 after Jacinda Ardern resigned.',
  },
  {
    name: 'Christopher Luxon',
    party: 'national',
    fromYear: 2023,
    toYear: null,
    citation:
      'Christopher Luxon became prime minister on 27 November 2023 after National led the 2023 coalition.',
  },
];

/** A contiguous stretch of prime ministers from the same party. */
export interface PrimeMinisterRun {
  party: PrimeMinisterPeriod['party'];
  fromYear: number;
  toYear: number | null;
  names: string;
}

/**
 * Last name of a prime minister, for short labels on charts.
 * @param name
 */
export function surnameOf(name: string): string {
  return name.split(' ').at(-1) ?? name;
}

/**
 * Merges consecutive same-party prime ministers into contiguous runs, so an
 * overlay can colour one band per governing party and label it with every
 * prime minister who held it.
 * @param periods
 */
export function primeMinisterRuns(
  periods: PrimeMinisterPeriod[] = PRIME_MINISTERS,
): PrimeMinisterRun[] {
  const runs: PrimeMinisterRun[] = [];
  for (const period of periods) {
    const previous = runs[runs.length - 1];
    if (previous?.party === period.party) {
      previous.toYear = period.toYear;
      previous.names = `${previous.names} · ${surnameOf(period.name)}`;
    } else {
      runs.push({
        party: period.party,
        fromYear: period.fromYear,
        toYear: period.toYear,
        names: surnameOf(period.name),
      });
    }
  }
  return runs;
}

/**
 * Everyone who held the office at any point in a calendar year, oldest
 * first. A changeover year holds two names (2017 runs from Bill English to
 * Jacinda Ardern) and 2023 holds three, which is the point: a band labelled
 * "Ardern +1" cannot say who was in the job when a given election happened,
 * so tooltips read it off this list. Years before the list starts come back
 * empty.
 * @param year
 * @param periods
 */
export function primeMinistersDuringYear(
  year: number,
  periods: PrimeMinisterPeriod[] = PRIME_MINISTERS,
): PrimeMinisterPeriod[] {
  return periods.filter(
    (period) => period.fromYear <= year && (period.toYear === null || period.toYear >= year),
  );
}
