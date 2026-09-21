import type { ChartEventMarker } from '@/lib/event-markers';

/**
 * Government changes since 1984, with the date the new government took
 * office. Curated from election results: the party with the most seats is
 * not always the one in government (1996, 2017), so these are pinned facts,
 * not a derivation. Client-safe: no node imports, so charts can use it.
 */
export const GOVERNMENT_CHANGE_EVENTS: ChartEventMarker[] = [
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
