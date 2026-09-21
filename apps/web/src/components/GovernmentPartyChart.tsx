'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { ParliamentPartyRow } from '@/lib/government-data';
import { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-events';
import { bucketKeyFor, PARTY_BUCKETS } from '@/lib/party-buckets';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain, EventMarkerLegend, EventReferenceLines } from './ChartNotes';

interface GovernmentPartyChartProps {
  rows: ParliamentPartyRow[];
}

interface ChartRow extends Record<string, number | string> {
  year: number;
}

function toChartRows(rows: ParliamentPartyRow[]): ChartRow[] {
  return rows.map((row) => {
    const counts: Record<string, number> = {};
    for (const bucket of PARTY_BUCKETS) {
      counts[bucket.key] = 0;
    }
    counts.other = 0;
    for (const party of row.parties) {
      const key = bucketKeyFor(party.party);
      counts[key] = (counts[key] ?? 0) + party.seats;
    }
    return { year: row.electionYear, ...counts };
  });
}

function formatSeats(value: string | number | undefined): string {
  return typeof value === 'number' ? String(Math.round(value)) : '—';
}

/**
 * Tooltip shown while hovering or scrubbing the chart.
 * @param root0
 * @param root0.active
 * @param root0.label
 * @param root0.payload
 */
function PartyTooltip({ active, label, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="text-[var(--color-muted)]">
          {String(entry.name)}: {formatSeats(Number(entry.value))} seats
        </p>
      ))}
    </div>
  );
}

/**
 * Seats by party per parliament, election years 1984 to 2023, as stacked bars.
 * @param root0
 * @param root0.rows
 */
export function GovernmentPartyChart({ rows }: GovernmentPartyChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const chartRows = toChartRows(rows);
  return (
    <div>
      <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
        {PARTY_BUCKETS.map((bucket) => (
          <li key={bucket.key} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: bucket.color }}
              aria-hidden="true"
            />
            <span className="numeral-paragraph-sm text-[var(--color-muted)]">{bucket.label}</span>
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-full bg-[var(--color-muted)]"
            aria-hidden="true"
          />
          <span className="numeral-paragraph-sm text-[var(--color-muted)]">Other</span>
        </li>
      </ul>
      <div className="h-80 w-full" aria-hidden={prefersReducedMotion}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartRows}
            margin={{ top: 24, right: 8, bottom: 8, left: 8 }}
            aria-label="Seats by party per parliament, 1984 to 2023"
          >
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={32}
              domain={[0, 'dataMax']}
              tickFormatter={(value: number) => String(Math.round(value))}
            />
            <Tooltip
              content={PartyTooltip}
              cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
            />
            <EventReferenceLines events={GOVERNMENT_CHANGE_EVENTS} />
            {PARTY_BUCKETS.map((bucket) => (
              <Bar
                key={bucket.key}
                dataKey={bucket.key}
                name={bucket.label}
                stackId="seats"
                fill={bucket.color}
                isAnimationActive={!prefersReducedMotion}
              />
            ))}
            <Bar
              dataKey="other"
              name="Other"
              stackId="seats"
              fill="var(--color-muted)"
              isAnimationActive={!prefersReducedMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Each bar is one election year. The colours are the parties. Taller means more seats. The
        flags mark the years the government changed: 1984, 1990, 1999, 2008, 2017, and 2023.
      </ChartExplain>
      <EventMarkerLegend
        heading="Government changes on this chart"
        events={GOVERNMENT_CHANGE_EVENTS}
      />
      <ChartDataTable
        summary="Seats by party per election, 1984 to 2023."
        columns={[
          { key: 'year', header: 'Election year' },
          { key: 'labour', header: 'Labour', format: formatSeats },
          { key: 'national', header: 'National', format: formatSeats },
          { key: 'green', header: 'Green', format: formatSeats },
          { key: 'nzFirst', header: 'NZ First', format: formatSeats },
          { key: 'act', header: 'ACT', format: formatSeats },
          { key: 'other', header: 'Other', format: formatSeats },
        ]}
        rows={chartRows}
      />
    </div>
  );
}
