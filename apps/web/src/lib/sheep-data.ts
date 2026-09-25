import { createStatsNzClient, parseStatsNzCsv, StatsNzError } from '@kiwilab/stats-nz';
import type { StatsNzObservation } from '@kiwilab/stats-nz';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// Table AGR_AGR_003 (Livestock Numbers by Regional Council) in the Aotearoa
// Data Explorer. Codes below were verified against published Stats NZ figures
// (national sheep: 49.5m in 1994, 32.6m in 2010); the codelist endpoint needs
// a subscription key, so the code-to-label mapping is pinned here until then.
export const SHEEP_DATAFLOW_ID = 'AGR_AGR_003';
export const SHEEP_LIVESTOCK_CODE = '6731';
export const NATIONAL_AREA_CODE = '20';

// Real snapshot of the same table, committed so the static build still works
// when the Stats NZ gateway blocks the build runner (GitHub Actions IPs get
// 401 on the keyless path).
const SHEEP_FIXTURE_PATH = path.join(
  process.cwd(),
  '../../packages/stats-nz/src/fixtures/agricultural-livestock-regional-council-2025-08-17.csv',
);

export interface SheepSeriesPoint {
  year: number;
  sheep: number;
}

export interface SheepSeries {
  points: SheepSeriesPoint[];
  first: SheepSeriesPoint;
  peak: SheepSeriesPoint;
  latest: SheepSeriesPoint;
  changeFromFirstPercent: number;
  changeFromPeakPercent: number;
}

function percentChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

export function buildSheepSeries(rows: StatsNzObservation[]): SheepSeries {
  const points: SheepSeriesPoint[] = [];
  for (const row of rows) {
    if (row.dimensions.LIVESTOCK !== SHEEP_LIVESTOCK_CODE) {
      continue;
    }
    if (row.dimensions.AREA !== NATIONAL_AREA_CODE) {
      continue;
    }
    if (row.value === null) {
      continue;
    }
    const year = Number(row.dimensions.YEAR);
    if (!Number.isFinite(year)) {
      continue;
    }
    points.push({ year, sheep: row.value });
  }
  points.sort((a, b) => a.year - b.year);

  const first = points[0];
  const latest = points[points.length - 1];
  if (first === undefined || latest === undefined) {
    throw new StatsNzError('No national sheep observations found in the Stats NZ response');
  }

  let peak = first;
  for (const point of points) {
    if (point.sheep > peak.sheep) {
      peak = point;
    }
  }

  return {
    points,
    first,
    peak,
    latest,
    changeFromFirstPercent: percentChange(first.sheep, latest.sheep),
    changeFromPeakPercent: percentChange(peak.sheep, latest.sheep),
  };
}

export async function fetchSheepSeries(subscriptionKey?: string): Promise<SheepSeries> {
  const client = createStatsNzClient({
    ...(subscriptionKey === undefined ? {} : { subscriptionKey }),
    // The page is a static export (no server), so the fetch must be
    // cacheable at build time instead of the client's default no-store.
    fetchImpl: (input, init) => globalThis.fetch(input, { ...init, cache: 'force-cache' }),
  });
  try {
    const rows = await client.getData({ dataflowId: SHEEP_DATAFLOW_ID, format: 'csv' });
    return buildSheepSeries(rows);
  } catch {
    const rows = parseStatsNzCsv(readFileSync(SHEEP_FIXTURE_PATH, 'utf8'), {
      dataflowId: SHEEP_DATAFLOW_ID,
    });
    return buildSheepSeries(rows);
  }
}
