import { StatsNzError } from '@kiwilab/stats-nz';
import type { StatsNzObservation } from '@kiwilab/stats-nz';

/** One row of a "wide" time series: a year plus one value per named series. */
export type WideSeriesPoint<K extends string = string> = { year: number } & Record<K, number>;

export interface WideSeries<K extends string = string> {
  points: WideSeriesPoint<K>[];
  first: WideSeriesPoint<K>;
  latest: WideSeriesPoint<K>;
}

/**
 * Builds a wide time series from Stats NZ observations, keeping only the
 * national area and the codes listed in `codeToKey`. Rows for the same year
 * are merged into one point.
 */
export function buildWideSeries<K extends string>(
  rows: StatsNzObservation[],
  options: {
    dimension: string;
    areaCode: string;
    codeToKey: Record<string, K>;
  },
): WideSeries<K> {
  const byYear = new Map<number, WideSeriesPoint<K>>();
  for (const row of rows) {
    if (row.dimensions.AREA !== options.areaCode) {
      continue;
    }
    const seriesKey = options.codeToKey[row.dimensions[options.dimension] ?? ''];
    if (seriesKey === undefined) {
      continue;
    }
    if (row.value === null) {
      continue;
    }
    const year = Number(row.dimensions.YEAR);
    if (!Number.isFinite(year)) {
      continue;
    }
    const point = byYear.get(year) ?? ({ year } as WideSeriesPoint<K>);
    (point as Record<string, number>)[seriesKey] = row.value;
    byYear.set(year, point);
  }

  const points = [...byYear.values()].sort((a, b) => a.year - b.year);
  const first = points[0];
  const latest = points[points.length - 1];
  if (first === undefined || latest === undefined) {
    throw new StatsNzError('No observations found in the Stats NZ response');
  }
  return { points, first, latest };
}

export interface SeriesStat<K extends string> {
  key: K;
  label: string;
  emoji: string;
  first: number;
  latest: number;
  peak: number;
  peakYear: number;
  changeFromFirstPercent: number;
  changeFromPeakPercent: number;
}

function percentChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

/** Per-series headline stats: first/latest values, peak year, and changes. */
export function summarizeWideSeries<K extends string>(
  series: WideSeries<K>,
  definitions: Array<{ key: K; label: string; emoji: string }>,
): SeriesStat<K>[] {
  return definitions.map((definition) => {
    let peak = series.first[definition.key];
    let peakYear = series.first.year;
    for (const point of series.points) {
      if (point[definition.key] > peak) {
        peak = point[definition.key];
        peakYear = point.year;
      }
    }
    const first = series.first[definition.key];
    const latest = series.latest[definition.key];
    return {
      key: definition.key,
      label: definition.label,
      emoji: definition.emoji,
      first,
      latest,
      peak,
      peakYear,
      changeFromFirstPercent: percentChange(first, latest),
      changeFromPeakPercent: percentChange(peak, latest),
    };
  });
}
