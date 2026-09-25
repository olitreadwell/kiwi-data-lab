'use client';

import { primeMinistersDuringYear } from '@/lib/government-pms';

/**
 * Tooltip line naming the prime ministers who held office in one year, so a
 * shortened band label ("Ardern +1") can still be read off the chart. A
 * changeover year names every holder, oldest first. Renders nothing for a
 * year the list does not cover.
 * @param root0
 * @param root0.year
 */
export function PrimeMinisterTooltipLine({ year }: { year: number }): React.ReactElement | null {
  const holders = primeMinistersDuringYear(year);
  if (holders.length === 0) {
    return null;
  }
  return (
    <p>
      {holders.length > 1 ? 'Prime ministers' : 'Prime minister'}:{' '}
      {holders.map((holder) => holder.name).join(', ')}
    </p>
  );
}
