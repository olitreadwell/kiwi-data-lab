import { describe, expect, it } from 'vitest';

import { PRIME_MINISTERS, primeMinisterRuns, surnameOf } from './government-pms';

describe('PRIME_MINISTERS', () => {
  it('is contiguous by calendar year from 1984 to the present', () => {
    expect(PRIME_MINISTERS[0]?.fromYear).toBe(1984);
    expect(PRIME_MINISTERS[0]?.name).toBe('David Lange');
    for (let index = 1; index < PRIME_MINISTERS.length; index += 1) {
      const previous = PRIME_MINISTERS[index - 1];
      const current = PRIME_MINISTERS[index];
      expect(current?.fromYear).toBe(previous?.toYear);
    }
    expect(PRIME_MINISTERS.at(-1)?.toYear).toBeNull();
  });

  it('covers every calendar year from 1984 to present exactly once', () => {
    for (let year = 1984; year < 2026; year += 1) {
      const holders = PRIME_MINISTERS.filter(
        (pm) => pm.fromYear <= year && (pm.toYear === null || year < pm.toYear),
      );
      expect(holders).toHaveLength(1);
    }
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
    ]);
  });

  it('labels the first run with every prime minister who held it', () => {
    const runs = primeMinisterRuns();
    expect(runs[0]?.names).toBe('Lange · Palmer · Moore');
    expect(runs[0]?.fromYear).toBe(1984);
    expect(runs[0]?.toYear).toBe(1990);
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
