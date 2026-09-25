'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import { electionYearRangeLabelFor } from '@/lib/government-data';
import type { ParliamentPartyRow } from '@/lib/government-data';
import { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-events';
import { PARTY_BUCKETS, partyBucketsBySizeFor } from '@/lib/party-buckets';
import { formatShare, toPartyShareRows } from '@/lib/party-share';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain, EventMarkerLegend, EventReferenceLines } from './ChartNotes';
import { PrimeMinisterBand } from './PrimeMinisterBand';
import { PrimeMinisterLegend } from './PrimeMinisterLegend';
import { PrimeMinisterTooltipLine } from './PrimeMinisterTooltipLine';

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
  const year = Number(label);
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-fg)] shadow-sm">
      <p className="font-medium">{label}</p>
      {Number.isFinite(year) ? <PrimeMinisterTooltipLine year={year} /> : null}
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
  // Smallest party first, so the biggest block of each stack sits on top.
  const stackOrder = partyBucketsBySizeFor(rows);
  const yearRangeLabel = electionYearRangeLabelFor(rows);
  const firstYear = shareRows[0]?.year ?? 0;
  const lastYear = shareRows[shareRows.length - 1]?.year ?? 0;
  // Leave room past the last election: the current prime minister's band is
  // only as wide as the years it covers, and the name inside it needs about
  // four years of width before it can be drawn at all.
  const domainEndYear = lastYear + 4;
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
            aria-label={`Share of seats by party per parliament, ${yearRangeLabel}`}
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
            <Area
              dataKey="other"
              name="Other"
              stackId="share"
              fill="var(--color-muted)"
              stroke="var(--color-muted)"
              strokeWidth={1}
              isAnimationActive={!prefersReducedMotion}
            />
            {stackOrder.map((bucket) => (
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
            <EventReferenceLines events={GOVERNMENT_CHANGE_EVENTS} />
            <PrimeMinisterBand fromYear={firstYear} toYear={domainEndYear} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain>
        Time runs left to right, one year per election. The height of each coloured band is that
        party&apos;s share of all seats, so the bands always add up to 100%. The dashed flags mark
        the years the government changed. The band across the top shows which party held the prime
        ministership between elections, in the same party colours. A band names the prime ministers
        who held the office when their names fit. When they do not, it shows the first name and a
        count of the others, or nothing at all on a narrow screen. The list below always has every
        one of them with their dates, and hovering a year names the prime ministers who held office
        then. The smallest parties sit at the bottom of the stack and the biggest on top, so the
        biggest blocks are the easiest ones to read.
      </ChartExplain>
      <EventMarkerLegend
        heading="Government changes on this chart"
        events={GOVERNMENT_CHANGE_EVENTS}
      />
      <PrimeMinisterLegend />
      <ChartDataTable
        summary={`Share of seats by party per election, ${yearRangeLabel}, as a percentage.`}
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
