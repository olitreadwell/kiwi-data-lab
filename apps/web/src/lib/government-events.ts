import type { ChartEventMarker } from '@/lib/event-markers';

/**
 * Government changes since 1935, with the date the new government took
 * office. Curated from election results: the party with the most seats is
 * not always the one in government (in 2017 National won 56 seats and Labour
 * formed the government), so these are pinned facts, not a derivation.
 * Client-safe: no node imports, so charts can use it.
 */
export const GOVERNMENT_CHANGE_EVENTS: ChartEventMarker[] = [
  {
    x: 1935,
    label: 'Labour takes office',
    citation:
      'The 1935 general election was held on 27 November 1935 and Labour formed the government, its first.',
  },
  {
    x: 1949,
    label: 'National takes office',
    citation:
      'The 1949 general election was held on 30 November 1949 and National formed the government.',
  },
  {
    x: 1957,
    label: 'Labour takes office',
    citation:
      'The 1957 general election was held on 30 November 1957 and Labour formed the government.',
  },
  {
    x: 1960,
    label: 'National takes office',
    citation:
      'The 1960 general election was held on 26 November 1960 and National formed the government.',
  },
  {
    x: 1972,
    label: 'Labour takes office',
    citation:
      'The 1972 general election was held on 25 November 1972 and Labour formed the government.',
  },
  {
    x: 1975,
    label: 'National takes office',
    citation:
      'The 1975 general election was held on 29 November 1975 and National formed the government.',
  },
  {
    x: 1984,
    label: 'Labour takes office',
    citation:
      'The 1984 general election was held on 14 July 1984 and Labour formed the government.',
  },
  {
    x: 1990,
    label: 'National takes office',
    citation:
      'The 1990 general election was held on 27 October 1990 and National formed the government.',
  },
  {
    x: 1999,
    label: 'Labour takes office',
    citation:
      'The 1999 general election was held on 27 November 1999 and Labour led the government.',
  },
  {
    x: 2008,
    label: 'National takes office',
    citation:
      'The 2008 general election was held on 8 November 2008 and National formed the government.',
  },
  {
    x: 2017,
    label: 'Labour takes office',
    citation:
      'The 2017 general election was held on 23 September 2017 and Labour led the government.',
  },
  {
    x: 2023,
    label: 'National takes office',
    citation:
      'The 2023 general election was held on 14 October 2023 and National led the government.',
  },
];
