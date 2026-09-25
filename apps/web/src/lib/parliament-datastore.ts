/**
 * Reads seats per parliament for the build: the live data.govt.nz CKAN
 * datastore first, then the committed snapshot of the same table. Server
 * only, because it touches the filesystem and the network.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  PARLIAMENT_DATASTORE_FIELDS,
  PARLIAMENT_RESOURCE_ID,
  ParliamentSeatDataError,
  parsePartySeats,
} from '@/lib/government-data';
import type { ParliamentSeatResult } from '@/lib/government-data';

/** Committed snapshot of the datastore, used when the API is unreachable. */
const PARLIAMENT_SNAPSHOT_PATH = path.join(process.cwd(), 'src/lib/fixtures/mp-member-terms.json');

/** Reads the committed datastore snapshot, used when the API is unreachable. */
function readParliamentSnapshot(): unknown {
  return JSON.parse(readFileSync(PARLIAMENT_SNAPSHOT_PATH, 'utf8')) as unknown;
}

/** Every Member Terms row the parser needs, paged out of the datastore. */
async function fetchParliamentTermRows(fetchImpl: typeof globalThis.fetch): Promise<unknown[]> {
  const rows: unknown[] = [];
  let offset = 0;
  for (;;) {
    const url =
      `https://catalogue.data.govt.nz/api/3/action/datastore_search` +
      `?resource_id=${PARLIAMENT_RESOURCE_ID}&limit=5000&offset=${offset}` +
      `&fields=${encodeURIComponent(PARLIAMENT_DATASTORE_FIELDS.join(','))}`;
    const response = await fetchImpl(url, { cache: 'force-cache' });
    if (!response.ok) {
      throw new ParliamentSeatDataError(`data.govt.nz HTTP ${String(response.status)}`);
    }
    const payload = (await response.json()) as {
      result?: { records?: unknown[]; total?: number };
    };
    const records = payload.result?.records ?? [];
    rows.push(...records);
    const total = payload.result?.total ?? 0;
    if (rows.length >= total || records.length === 0) {
      return rows;
    }
    offset = rows.length;
  }
}

/**
 * Fetches seats per parliament from the datastore, falling back to the
 * committed snapshot when the API is unreachable. The page states which one
 * it used, and a snapshot that cannot produce election years throws instead
 * of rendering zeros.
 * @param fetchImpl - fetch implementation, injectable for tests
 */
export async function fetchParliamentPartySeats(
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
): Promise<ParliamentSeatResult> {
  try {
    const payload = await fetchParliamentTermRows(fetchImpl);
    return { rows: parsePartySeats(payload), source: 'datastore' };
  } catch (error) {
    console.warn(
      `[parliament] datastore fetch failed, using the committed snapshot: ${String(error)}`,
    );
    return { rows: parsePartySeats(readParliamentSnapshot()), source: 'snapshot' };
  }
}
