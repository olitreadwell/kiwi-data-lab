import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { ParliamentPartyRow } from '@/lib/government-data';

import { GovernmentSeatShareChart } from './GovernmentSeatShareChart';

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

describe('GovernmentSeatShareChart', () => {
  it('shows the how-to-read note and the party colour legend', () => {
    render(<GovernmentSeatShareChart rows={ROWS} />);
    expect(screen.getByText(/Time runs left to right/)).toBeInTheDocument();
    expect(screen.getAllByText('Labour').length).toBeGreaterThan(0);
    expect(screen.getAllByText('National').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0);
  });

  it('lists every prime minister since 1984 with their years', () => {
    render(<GovernmentSeatShareChart rows={ROWS} />);
    expect(screen.getByText('Prime ministers on this chart')).toBeInTheDocument();
    expect(screen.getAllByText(/David Lange/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jacinda Ardern/).length).toBeGreaterThan(0);
    expect(screen.getByText(/2023–present/)).toBeInTheDocument();
  });

  it('labels the prime minister bands inside the chart domain', () => {
    render(<GovernmentSeatShareChart rows={ROWS} />);
    expect(screen.getByText('Key · English')).toBeInTheDocument();
    expect(screen.getAllByText('Ardern · Hipkins')).not.toHaveLength(0);
    expect(screen.getByText('Luxon')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GovernmentSeatShareChart rows={ROWS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15000);
});
