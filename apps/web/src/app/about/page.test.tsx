import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import AboutPage from './page';

expect.extend(toHaveNoViolations);

describe('AboutPage', () => {
  it('explains what the site is and where the data comes from', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'About kiwi-data-lab' })).toBeVisible();
    expect(screen.getByText(/national sheep flock/)).toBeVisible();
    expect(screen.getByText(/Stats NZ Aotearoa Data Explorer/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'nz-open-data-connectors' })).toHaveAttribute(
      'href',
      'https://github.com/olitreadwell/nz-open-data-connectors',
    );
    expect(screen.getByRole('link', { name: 'olitreadwell/new-zealand-data' })).toHaveAttribute(
      'href',
      'https://github.com/olitreadwell/new-zealand-data',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/olitreadwell/kiwi-data-lab',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AboutPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
