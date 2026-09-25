# ORCHESTRATION.md — sheep-index

Built 2025-08-17 to prove out `@kiwilab/stats-nz` end to end.

- TDD: package tests written first (unit/integration/perf/security/adversarial), then the
  client; same loop for `sheep-data.ts` (transform) and `SheepChart` (a11y).
- Live smoke tests run explicitly: `RUN_SMOKE=1 npm run test:smoke -w @kiwilab/stats-nz`.
- Two real findings surfaced by the tests: the SDMX catalogue nests dataflows under
  `Structure/Structures/Dataflows`, and the keyless gateway path requires the explicit
  published version (`1.0`) in the data URL. Both fixed and pinned by regression tests.
