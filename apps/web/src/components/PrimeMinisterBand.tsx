'use client';

import { ReferenceArea } from 'recharts';

import { GOVERNMENT_CHANGE_EVENTS } from '@/lib/government-events';
import { PRIME_MINISTERS, type PrimeMinisterRun, primeMinisterRuns } from '@/lib/government-pms';
import { PARTY_BUCKETS } from '@/lib/party-buckets';

/** Top of the percent domain where the prime minister band lives. */
const PM_BAND_Y1 = 92;
const PM_BAND_Y2 = 100;

/** Size of the names drawn inside a band. */
const LABEL_FONT_SIZE = 10;

/**
 * Width one character takes, as a fraction of the font size. Measured from
 * the face the chart draws in (Geist at weight 600), where mixed-case
 * surnames run between 0.52 and 0.60 of the size per character. Rounded up,
 * because an over-estimate only costs a shorter label and an under-estimate
 * runs a name into the next band.
 */
const LABEL_CHARACTER_WIDTH_RATIO = 0.58;

/** Space kept between a name and the edge of its band. */
const LABEL_EDGE_PADDING = 4;

/**
 * Space kept clear at the right of a band that ends on a government change.
 * The flag for that year is drawn just left of the line and a two-digit one
 * runs to about 13px, so without this the number lands on the tail of the
 * name. Sized to the flag rather than padded further, because the bands that
 * end on a change are the narrowest ones on the chart.
 */
const FLAG_LABEL_CLEARANCE = 13;

/** Government-change years, which is where the numbered flags are drawn. */
const CHANGE_YEARS = new Set(GOVERNMENT_CHANGE_EVENTS.map((event) => event.x));

/**
 * Text to draw inside a band of the given pixel width, or undefined when
 * even one surname does not fit. Bands are measured rather than guessed at,
 * so a 1935 run of five prime ministers reads differently on a phone and on
 * a desktop. When the full list of names is too long, the first surname
 * carries a count of the rest, and the legend below the chart lists them all.
 */
export function bandLabelFor(names: string, availableWidth: number): string | undefined {
  const fits = (text: string): boolean =>
    text.length * LABEL_CHARACTER_WIDTH_RATIO * LABEL_FONT_SIZE + LABEL_EDGE_PADDING <=
    availableWidth;
  if (fits(names)) {
    return names;
  }
  const surnames = names.split(' · ');
  const first = surnames[0];
  if (first === undefined) {
    return undefined;
  }
  const shortened = `${first} +${String(surnames.length - 1)}`;
  if (surnames.length > 1 && fits(shortened)) {
    return shortened;
  }
  return fits(first) ? first : undefined;
}

/** Pixel box recharts hands to a band label, in chart coordinates. */
interface BandLabelBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Draws one band's name, centred, or nothing when the band cannot hold it.
 * Reads the band's own box, so the text reflows when the chart resizes.
 */
function renderBandLabel(
  names: string,
  rightYear: number,
  box: BandLabelBox | undefined,
): React.ReactElement | null {
  if (
    box?.x === undefined ||
    box.y === undefined ||
    box.width === undefined ||
    box.height === undefined
  ) {
    return null;
  }
  // Only a band that ends on a change year shares its right edge with a flag.
  const clearance = CHANGE_YEARS.has(rightYear) ? FLAG_LABEL_CLEARANCE : 0;
  const usableWidth = box.width - clearance;
  const text = bandLabelFor(names, usableWidth);
  if (text === undefined) {
    return null;
  }
  return (
    <text
      x={box.x + usableWidth / 2}
      y={box.y + box.height / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={LABEL_FONT_SIZE}
      fontWeight={600}
      fill="#FFFFFF"
    >
      {text}
    </text>
  );
}

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
            key={`${run.names}-${String(run.fromYear)}`}
            x1={run.fromYear}
            x2={run.toYear ?? toYear}
            y1={PM_BAND_Y1}
            y2={PM_BAND_Y2}
            fill={color}
            stroke="none"
            label={(props: { viewBox?: BandLabelBox }) =>
              renderBandLabel(run.names, run.toYear ?? toYear, props.viewBox)
            }
          />
        );
      })}
    </>
  );
}
