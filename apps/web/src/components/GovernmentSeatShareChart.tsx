'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { ParliamentPartyRow } from '@/lib/government-data';
import { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-events';
import { PARTY_BUCKETS } from '@/lib/party-buckets';
import { formatShare, toPartyShareRows } from '@/lib/party-share';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain, EventMarkerLegend, EventReferenceLines } from './ChartNotes';
import { PrimeMinisterBand } from './PrimeMinisterBand';
import { PrimeMinisterLegend } from './PrimeMinisterLegend';

interface GovernmentSeatShareChartProps {
  rows: ParliamentPartyRow[];
}

/**
 * Tooltip shown while hovering or scrubbing the chart.
 * @param root0
 * @param root0.active
 * @param root0.label
 * @param root0.payload
 */
function ShareTooltip({ active, label, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="text-[var(--color-muted)]">
          {String(entry.name)}: {formatShare(Number(entry.value))} of seats
        </p>
      ))}
    </div>
  );
}

/**
 * Share of all seats held by each party after every election, 1984 to 2023,
 * as a stacked percent-area chart. Time runs left to right; the height of a
 * coloured band is that party's share of the house. The band across the top
 * overlays who held the prime ministership between elections.
 * @param root0
 * @param root0.rows
 */
export function GovernmentSeatShareChart({
  rows,
}: GovernmentSeatShareChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shareRows = toPartyShareRows(rows);
  const firstYear = shareRows[0]?.year ?? 0;
  const lastYear = shareRows[shareRows.length - 1]?.year ?? 0;
  // Leave two empty years past the last election so the current prime
  // minister's band has room to reach the right edge instead of vanishing.
  const domainEndYear = lastYear + 2;
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
          <AreaChart
            data={shareRows}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            aria-label="Share of seats by party per parliament, 1984 to 2023"
          >
            <XAxis
              dataKey="year"
              type="number"
              domain={[firstYear, domainEndYear]}
              ticks={shareRows.map((row) => row.year)}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={32}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${Math.round(value)}%`}
            />
            <Tooltip
              content={ShareTooltip}
              cursor={{ stroke: 'var(--color-border)', strokeDasharray: '4 4' }}
            />
            {PARTY_BUCKETS.map((bucket) => (
              <Area
                key={bucket.key}
                dataKey={bucket.key}
                name={bucket.label}
                stackId="share"
                fill={bucket.color}
                stroke={bucket.color}
                strokeWidth={1}
                isAnimationActive={!prefersReducedMotion}
              />
            ))}
            <Area
              dataKey="other"
              name="Other"
              stackId="share"
              fill="var(--color-muted)"
              stroke="var(--color-muted)"
              strokeWidth={1}
              isAnimationActive={!prefersReducedMotion}
            />
            <EventReferenceLines events={GOVERNMENT_CHANGE_EVENTS} />
            <PrimeMinisterBand fromYear={firstYear} toYear={domainEndYear} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Time runs left to right, one year per election. The height of each coloured band is that
        party&apos;s share of all seats, so the bands always add up to 100%. The dashed flags mark
        the six years the government changed. The band across the top shows which party held the
        prime ministership between elections — the same party colours, with the prime
        ministers&apos; names inside.
      </ChartExplain>
      <EventMarkerLegend
        heading="Government changes on this chart"
        events={GOVERNMENT_CHANGE_EVENTS}
      />
      <PrimeMinisterLegend />
      <ChartDataTable
        summary="Share of seats by party per election, as a percentage."
        columns={[
          { key: 'year', header: 'Election year' },
          { key: 'labour', header: 'Labour', format: formatShare },
          { key: 'national', header: 'National', format: formatShare },
          { key: 'green', header: 'Green', format: formatShare },
          { key: 'nzFirst', header: 'NZ First', format: formatShare },
          { key: 'act', header: 'ACT', format: formatShare },
          { key: 'other', header: 'Other', format: formatShare },
        ]}
        rows={shareRows}
      />
    </div>
  );
}
