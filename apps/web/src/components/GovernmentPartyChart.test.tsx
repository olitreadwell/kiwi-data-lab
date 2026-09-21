import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { ParliamentPartyRow } from '@/lib/government-data';

import { GovernmentPartyChart } from './GovernmentPartyChart';

expect.extend(toHaveNoViolations);

const ROWS: ParliamentPartyRow[] = [
  {
    parliament: 49,
    electionYear: 2008,
    largestParty: 'New Zealand National Party',
    largestSeats: 60,
    parties: [
      { party: 'New Zealand National Party', seats: 60 },
      { party: 'New Zealand Labour Party', seats: 47 },
    ],
  },
  {
    parliament: 53,
    electionYear: 2020,
    largestParty: 'New Zealand Labour Party',
    largestSeats: 68,
    parties: [
      { party: 'New Zealand Labour Party', seats: 68 },
      { party: 'New Zealand National Party', seats: 36 },
    ],
  },
  {
    parliament: 54,
    electionYear: 2023,
    largestParty: 'New Zealand National Party',
    largestSeats: 50,
    parties: [
      { party: 'New Zealand National Party', seats: 50 },
      { party: 'New Zealand Labour Party', seats: 39 },
    ],
  },
];

describe('GovernmentPartyChart', () => {
  it('shows the how-to-read note and the government-change legend', () => {
    render(<GovernmentPartyChart rows={ROWS} />);
    expect(screen.getByText(/Each bar is one election year/)).toBeInTheDocument();
    expect(screen.getByText('Government changes on this chart')).toBeInTheDocument();
    expect(screen.getAllByText('Labour takes office')).toHaveLength(3);
    expect(screen.getAllByText('National takes office')).toHaveLength(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GovernmentPartyChart rows={ROWS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
