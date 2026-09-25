import { parseStatsNzCsv, StatsNzError } from '@kiwilab/stats-nz';
import type { StatsNzObservation } from '@kiwilab/stats-nz';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildSheepSeries, NATIONAL_AREA_CODE, SHEEP_LIVESTOCK_CODE } from './sheep-data';

// Real rows pulled from the ADE API (table AGR_AGR_003, format=csv) on
// 2025-08-17, kept small here so the transform test reads like a table.
const REAL_ROWS: StatsNzObservation[] = [
  { dimensions: { LIVESTOCK: '6731', AREA: '20', YEAR: '1994' }, value: 49466054 },
  { dimensions: { LIVESTOCK: '6731', AREA: '20', YEAR: '2010' }, value: 32562612 },
  { dimensions: { LIVESTOCK: '6731', AREA: '20', YEAR: '2025' }, value: 23252463 },
  { dimensions: { LIVESTOCK: '6731', AREA: '1', YEAR: '1994' }, value: 814163 },
  { dimensions: { LIVESTOCK: '6703', AREA: '20', YEAR: '1994' }, value: 36243948 },
  { dimensions: { LIVESTOCK: '6731', AREA: '20', YEAR: '1994' }, value: null, status: 's' },
  { dimensions: { LIVESTOCK: '6731', AREA: '20', YEAR: 'not-a-year' }, value: 1 },
];

const LIVESTOCK_FIXTURE = readFileSync(
  path.join(
    process.cwd(),
    '../../packages/stats-nz/src/fixtures/agricultural-livestock-regional-council-2025-08-17.csv',
  ),
  'utf8',
);

describe('buildSheepSeries', () => {
  it('keeps only national sheep rows with numeric values, sorted by year', () => {
    const series = buildSheepSeries(REAL_ROWS);
    expect(series.points.map((point) => point.year)).toEqual([1994, 2010, 2025]);
    expect(series.points[0]?.sheep).toBe(49466054);
    expect(series.points[2]?.sheep).toBe(23252463);
  });

  it('identifies the peak, latest, and percentage changes', () => {
    const series = buildSheepSeries(REAL_ROWS);
    expect(series.first).toEqual({ year: 1994, sheep: 49466054 });
    expect(series.peak).toEqual({ year: 1994, sheep: 49466054 });
    expect(series.latest).toEqual({ year: 2025, sheep: 23252463 });
    expect(series.changeFromPeakPercent).toBeCloseTo(-53, 0);
  });

  it('throws when no national sheep rows exist', () => {
    expect(() => buildSheepSeries([])).toThrow(StatsNzError);
    expect(() =>
      buildSheepSeries([{ dimensions: { LIVESTOCK: '9999', AREA: '20', YEAR: '2024' }, value: 1 }]),
    ).toThrow(StatsNzError);
  });

  it('exports the codes that identify the sheep national series', () => {
    expect(SHEEP_LIVESTOCK_CODE).toBe('6731');
    expect(NATIONAL_AREA_CODE).toBe('20');
  });
});

describe('sheep-data performance', () => {
  it('builds the sheep series from the full real 19k-row table within 1 second', async () => {
    const rows = parseStatsNzCsv(LIVESTOCK_FIXTURE, { dataflowId: 'AGR_AGR_003' });
    const start = performance.now();
    const series = buildSheepSeries(rows);
    const elapsedMs = performance.now() - start;
    expect(series.points.length).toBeGreaterThanOrEqual(25);
    expect(elapsedMs).toBeLessThan(1000);
  });
});
