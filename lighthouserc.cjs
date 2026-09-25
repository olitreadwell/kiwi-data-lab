// Read by `npm run perf`, which runs Lighthouse CI through npx rather than
// from a lockfile dependency. @lhci/cli@0.15.1 pins its own copy of
// lighthouse, and that tree carries open high severity advisories in
// extract-zip and tmp, which would fail `npm audit --audit-level=high` and
// block every push. The version is pinned in the perf script instead.
module.exports = {
  ci: {
    collect: {
      // The site is a static export (output: 'export'), so the audit runs
      // against the built `out` directory served by `serve`, matching what
      // the Playwright config serves in e2e. Run `npm run build` first.
      url: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:3000/about/',
        'http://127.0.0.1:3000/agriculture/sheep-index/',
        'http://127.0.0.1:3000/politics/parliament-party-seats/',
      ],
      startServerCommand: 'cd apps/web && npx serve out -l 3000',
      // Three runs, because the metric that moves most on a shared runner
      // (total-blocking-time) swung between 354ms and 944ms across two CI
      // runs of the same code. Lighthouse CI reports the median.
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      // Budgets are Lighthouse's mobile simulation (Moto G, slow 4G, 4x CPU).
      // The numbers it produces depend heavily on the machine underneath, so
      // the budgets below carry headroom over a measured baseline rather than
      // sitting on top of it.
      //
      // Local baseline, 2026-09-25 on an M-series Mac:
      //
      //   /                                 LCP 2485  FCP 756  TBT  29
      //   /about/                           LCP 2183  FCP 753  TBT  30
      //   /agriculture/sheep-index/         LCP 2857  FCP 754  TBT  73
      //   /politics/parliament-party-seats/ LCP 2856  FCP 753  TBT  88
      //
      // CI baseline, the same day on 2 vCPU ubuntu-latest runners: FCP and
      // LCP landed in the same range as local on both runs, and CLS stayed
      // at 0. TBT did not: run 36097802882 measured 354, 418 and 479ms,
      // run 36098191350 measured 672 and 944ms on the same code, which is
      // the 4x CPU throttle multiplying whatever the shared runner had
      // going on at the time.
      //
      // So FCP, LCP and CLS carry budgets that mean something, and TBT is a
      // coarse guard for a runaway render rather than a target. A regression
      // worth blocking moves it well past 1500ms.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 1500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
