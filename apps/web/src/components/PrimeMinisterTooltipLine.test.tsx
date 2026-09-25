import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PrimeMinisterTooltipLine } from './PrimeMinisterTooltipLine';

describe('PrimeMinisterTooltipLine', () => {
  it('names the single holder of a quiet year', () => {
    render(<PrimeMinisterTooltipLine year={2005} />);
    expect(screen.getByText('Prime minister: Helen Clark')).toBeInTheDocument();
  });

  it('names both holders of a changeover year', () => {
    render(<PrimeMinisterTooltipLine year={2017} />);
    expect(screen.getByText('Prime ministers: Bill English, Jacinda Ardern')).toBeInTheDocument();
  });

  it('names all three holders of 2023, which the band label cannot show', () => {
    render(<PrimeMinisterTooltipLine year={2023} />);
    expect(
      screen.getByText('Prime ministers: Jacinda Ardern, Chris Hipkins, Christopher Luxon'),
    ).toBeInTheDocument();
  });

  it('renders nothing for a year the list does not cover', () => {
    const { container } = render(<PrimeMinisterTooltipLine year={1934} />);
    expect(container).toBeEmptyDOMElement();
  });
});
