#!/usr/bin/env node
/**
 * Refreshes the committed Member Terms snapshot that
 * `apps/web/src/lib/government-data.ts` falls back to when the data.govt.nz
 * datastore is unreachable at build time.
 *
 * The snapshot holds the raw rows, not seat counts: the app parses both the
 * live payload and this file with the same `parsePartySeats`, so there is
 * one set of counting rules and no drift.
 *
 * Usage: node scripts/refresh-parliament-fixture.mjs
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RESOURCE_ID = '9767376e-ead0-468d-8b55-a65dfb629b54';
// Kept in step with PARLIAMENT_DATASTORE_FIELDS in government-data.ts.
const FIELDS = ['MemberID', 'Parliament', 'Party', 'Date_Elected', 'Method_of_Election'];
const PAGE_SIZE = 5000;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(repoRoot, 'apps/web/src/lib/fixtures/mp-member-terms.json');

async function fetchAllRows() {
  const rows = [];
  for (;;) {
    const url =
      `https://catalogue.data.govt.nz/api/3/action/datastore_search` +
      `?resource_id=${RESOURCE_ID}&limit=${String(PAGE_SIZE)}&offset=${String(rows.length)}` +
      `&fields=${encodeURIComponent(FIELDS.join(','))}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`data.govt.nz returned HTTP ${String(response.status)}`);
    }
    const payload = await response.json();
    const records = payload?.result?.records ?? [];
    rows.push(...records);
    const total = payload?.result?.total ?? 0;
    console.log(`fetched ${String(rows.length)} of ${String(total)} rows`);
    if (rows.length >= total || records.length === 0) {
      return rows;
    }
  }
}

const rows = await fetchAllRows();
if (rows.length === 0) {
  throw new Error('No rows fetched; refusing to overwrite the snapshot with an empty file');
}
writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`wrote ${String(rows.length)} rows to ${path.relative(repoRoot, outputPath)}`);
