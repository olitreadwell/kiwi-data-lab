'use client';

import { ReferenceArea } from 'recharts';

import { PRIME_MINISTERS, type PrimeMinisterRun, primeMinisterRuns } from '@/lib/government-pms';
import { PARTY_BUCKETS } from '@/lib/party-buckets';

/** Top of the percent domain where the prime minister band lives. */
const PM_BAND_Y1 = 92;
const PM_BAND_Y2 = 100;

const COLOR_BY_PARTY = new Map(PARTY_BUCKETS.map((bucket) => [bucket.key, bucket.color]));

function runWithinDomain(run: PrimeMinisterRun, fromYear: number): boolean {
  return run.toYear === null || run.toYear > fromYear;
}

function clampedRun(
  run: PrimeMinisterRun,
  fromYear: number,
  toYear: number,
): PrimeMinisterRun | null {
  const start = Math.max(run.fromYear, fromYear);
  const end = run.toYear === null ? toYear : Math.min(run.toYear, toYear);
  if (end <= start) {
    return null;
  }
  return { ...run, fromYear: start, toYear: end };
}

/**
 * Overlay for a time-series chart: one coloured band per governing party
 * across the chart's year domain, labelled with the prime ministers who
 * held it. Works with any recharts chart that has a numeric year axis and
 * a 0-100 percent domain. The band sits in the top 8% so it never covers
 * data.
 * @param root0
 * @param root0.fromYear
 * @param root0.toYear
 */
export function PrimeMinisterBand({
  fromYear,
  toYear,
}: {
  fromYear: number;
  toYear: number;
}): React.ReactElement {
  const runs = primeMinisterRuns(PRIME_MINISTERS)
    .filter((run) => runWithinDomain(run, fromYear))
    .map((run) => clampedRun(run, fromYear, toYear))
    .filter((run): run is PrimeMinisterRun => run !== null);
  return (
    <>
      {runs.map((run) => {
        const color = COLOR_BY_PARTY.get(run.party);
        return (
          <ReferenceArea
            key={run.names}
            x1={run.fromYear}
            x2={run.toYear ?? toYear}
            y1={PM_BAND_Y1}
            y2={PM_BAND_Y2}
            fill={color}
            stroke="none"
            label={{
              value: run.names,
              position: 'insideTop',
              fontSize: 10,
              fontWeight: 600,
              fill: '#FFFFFF',
            }}
          />
        );
      })}
    </>
  );
}
