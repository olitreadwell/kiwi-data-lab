import { describe, expect, it } from 'vitest';

import {
  PRIME_MINISTERS,
  primeMinisterRuns,
  primeMinistersDuringYear,
  surnameOf,
} from './government-pms';

describe('PRIME_MINISTERS', () => {
  it('is contiguous by calendar year from 1935 to the present', () => {
    expect(PRIME_MINISTERS[0]?.fromYear).toBe(1935);
    expect(PRIME_MINISTERS[0]?.name).toBe('Michael Joseph Savage');
    for (let index = 1; index < PRIME_MINISTERS.length; index += 1) {
      const previous = PRIME_MINISTERS[index - 1];
      const current = PRIME_MINISTERS[index];
      expect(current?.fromYear).toBe(previous?.toYear);
    }
    expect(PRIME_MINISTERS.at(-1)?.toYear).toBeNull();
  });

  it('covers every calendar year from 1935 to present exactly once', () => {
    for (let year = 1935; year < 2026; year += 1) {
      const holders = PRIME_MINISTERS.filter(
        (pm) => pm.fromYear <= year && (pm.toYear === null || year < pm.toYear),
      );
      expect(holders).toHaveLength(1);
    }
  });

  it('lists a prime minister who served twice as two periods', () => {
    const holyoake = PRIME_MINISTERS.filter((pm) => pm.name === 'Keith Holyoake');
    expect(holyoake.map((pm) => pm.fromYear)).toEqual([1957, 1960]);
  });
});

describe('surnameOf', () => {
  it('returns the last name', () => {
    expect(surnameOf('David Lange')).toBe('Lange');
    expect(surnameOf('Christopher Luxon')).toBe('Luxon');
  });

  it('returns a single-word name unchanged', () => {
    expect(surnameOf('Ardern')).toBe('Ardern');
  });
});

describe('primeMinisterRuns', () => {
  it('merges consecutive same-party prime ministers into one run per party', () => {
    const runs = primeMinisterRuns();
    expect(runs.map((run) => run.party)).toEqual([
      'labour',
      'national',
      'labour',
      'national',
      'labour',
      'national',
      'labour',
      'national',
      'labour',
      'national',
      'labour',
      'national',
    ]);
  });

  it('labels the first run with every prime minister who held it', () => {
    const runs = primeMinisterRuns();
    expect(runs[0]?.names).toBe('Savage · Fraser');
    expect(runs[0]?.fromYear).toBe(1935);
    expect(runs[0]?.toYear).toBe(1949);
  });

  it('keeps two runs apart for a prime minister who served twice', () => {
    const runs = primeMinisterRuns();
    expect(runs.filter((run) => run.names.includes('Holyoake')).map((run) => run.fromYear)).toEqual(
      [1949, 1960],
    );
  });

  it('is contiguous by year like the source list', () => {
    const runs = primeMinisterRuns();
    for (let index = 1; index < runs.length; index += 1) {
      const previous = runs[index - 1];
      const current = runs[index];
      expect(current?.fromYear).toBe(previous?.toYear);
    }
  });

  it('keeps the current party open-ended', () => {
    const runs = primeMinisterRuns();
    expect(runs.at(-1)?.party).toBe('national');
    expect(runs.at(-1)?.names).toBe('Luxon');
    expect(runs.at(-1)?.toYear).toBeNull();
  });
});

describe('primeMinistersDuringYear', () => {
  it('names everyone who held office in a changeover year, oldest first', () => {
    expect(primeMinistersDuringYear(1984).map((pm) => pm.name)).toEqual([
      'Robert Muldoon',
      'David Lange',
    ]);
    expect(primeMinistersDuringYear(2017).map((pm) => pm.name)).toEqual([
      'Bill English',
      'Jacinda Ardern',
    ]);
  });

  it('names all three holders of 2023', () => {
    expect(primeMinistersDuringYear(2023).map((pm) => pm.name)).toEqual([
      'Jacinda Ardern',
      'Chris Hipkins',
      'Christopher Luxon',
    ]);
  });

  it('names the one holder of a quiet year', () => {
    expect(primeMinistersDuringYear(2005).map((pm) => pm.name)).toEqual(['Helen Clark']);
  });

  it('returns nothing before the list starts', () => {
    expect(primeMinistersDuringYear(1934)).toEqual([]);
  });
});
