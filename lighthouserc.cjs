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
      startServerReadyPattern: 'Serving!',
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      // Budgets are Lighthouse's mobile simulation (Moto G, slow 4G, 4x CPU),
      // which is the harsh end of what a public site should survive. The
      // measured baseline on 2026-09-25, three runs per URL, was:
      //
      //   /                                 LCP 2485  FCP 756  TBT  29
      //   /about/                           LCP 2183  FCP 753  TBT  30
      //   /agriculture/sheep-index/         LCP 2857  FCP 754  TBT  73
      //   /politics/parliament-party-seats/ LCP 2856  FCP 753  TBT  88
      //
      // Observed (unthrottled) LCP on the same runs was 42-83ms on every
      // page, so the simulated figure is dominated by the throttle model
      // rather than by the site. The LCP budget carries headroom above the
      // baseline; FCP, TBT and CLS are already comfortable and stay tight.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
