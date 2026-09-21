import type { PartyBucketKey } from '@/lib/party-buckets';

/**
 * New Zealand prime ministers since 1984, curated as pinned facts (same
 * status as GOVERNMENT_CHANGE_EVENTS): the governing party is not always
 * the largest party, and who held the top job is a documented fact, not a
 * derivation. Client-safe so charts can use it.
 */

/** One prime ministerial term since 1984. */
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

/** Prime ministers since 1984, oldest first and contiguous by calendar year. */
export const PRIME_MINISTERS: PrimeMinisterPeriod[] = [
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
