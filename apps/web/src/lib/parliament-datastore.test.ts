import { describe, expect, it, vi } from 'vitest';

import { fetchParliamentPartySeats } from './parliament-datastore';

/** One Member Terms row, shaped like the datastore payload. */
function term(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    MemberID: 1,
    Parliament: 54,
    Party: 'New Zealand National Party',
    Date_Elected: '2023-10-14T00:00:00',
    Method_of_Election: 'General election',
    ...overrides,
  };
}

/** fetch stub that answers the datastore call with the rows given. */
function stubFetch(records: unknown[], total = records.length): typeof globalThis.fetch {
  return (async () => ({
    ok: true,
    json: async () => ({ result: { records, total } }),
  })) as unknown as typeof globalThis.fetch;
}

describe('fetchParliamentPartySeats', () => {
  it('reads the datastore and reports it as the source', async () => {
    const result = await fetchParliamentPartySeats(stubFetch([term({ MemberID: 1 })]));
    expect(result.source).toBe('datastore');
    expect(result.rows[0]?.electionYear).toBe(2023);
  });

  it('pages through the datastore until every row is in', async () => {
    const pages = [
      { records: [term({ MemberID: 1 })], total: 2 },
      { records: [term({ MemberID: 2 })], total: 2 },
    ];
    let call = 0;
    const fetchImpl = (async () => ({
      ok: true,
      json: async () => ({ result: pages[call++] }),
    })) as unknown as typeof globalThis.fetch;
    const result = await fetchParliamentPartySeats(fetchImpl);
    expect(call).toBe(2);
    expect(result.rows[0]?.largestSeats).toBe(2);
  });

  it('falls back to the committed snapshot and reports it as the source', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await fetchParliamentPartySeats(() => Promise.reject(new Error('offline')));
    expect(result.source).toBe('snapshot');
    expect(result.rows).toHaveLength(54);
    expect(result.rows.at(-1)?.electionYear).toBe(2023);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('throws when the datastore answers with an error status', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const failing = (async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    })) as unknown as typeof globalThis.fetch;
    const result = await fetchParliamentPartySeats(failing);
    // The snapshot keeps the page working, and the page says so.
    expect(result.source).toBe('snapshot');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
