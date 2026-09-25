import { describe, expect, it } from 'vitest';

import { bandLabelFor } from './PrimeMinisterBand';

describe('bandLabelFor', () => {
  it('names every prime minister in the run when they fit', () => {
    expect(bandLabelFor('Ardern · Hipkins', 200)).toBe('Ardern · Hipkins');
  });

  it('keeps the first name and counts the rest when the run is narrow', () => {
    expect(bandLabelFor('Ardern · Hipkins', 70)).toBe('Ardern +1');
    expect(bandLabelFor('Savage · Fraser', 60)).toBe('Savage +1');
  });

  it('keeps the first surname when there is room for one name only', () => {
    expect(bandLabelFor('Ardern · Hipkins', 50)).toBe('Ardern');
    expect(bandLabelFor('Luxon', 40)).toBe('Luxon');
  });

  it('still names the two most recent runs when their bands are at their narrowest', () => {
    // 2017-2023 and 2023-2027 are the narrowest bands on the current data,
    // so they lose the flag to a government-change number first. Widths
    // measured from the rendered chart in a 900px window.
    const ardernBand = 52;
    const luxonBand = 35;
    expect(bandLabelFor('Ardern · Hipkins', ardernBand - 13)).toBe('Ardern');
    expect(bandLabelFor('Luxon', luxonBand)).toBe('Luxon');
  });

  it('draws nothing when the band cannot hold a name', () => {
    expect(bandLabelFor('Luxon', 30)).toBeUndefined();
    expect(bandLabelFor('Nash', 20)).toBeUndefined();
  });
});
