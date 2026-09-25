# sheep-index — The Sheep Index

## Pitch

New Zealand's national animal is in freefall: the sheep flock has nearly halved since 1994
(49.5 million then, 23.3 million in 2025). Why would anyone be surprised by the decline of
sheep? Because it is the biggest single-number story in NZ agriculture, and the ADE API makes
it fetchable live.

## Data source

Stats NZ Aotearoa Data Explorer, table `AGR_AGR_003` (Livestock Numbers by Regional Council),
fetched at deploy time as `format=csv` via `@kiwilab/stats-nz`. The page filters the national
sheep series (livestock code `6731`, area code `20` = New Zealand total). The site is a
static export, so the page is a build-time snapshot; the deploy workflow runs daily to keep the
numbers fresh. If the Stats NZ gateway blocks the build runner (GitHub Actions IPs get 401 on
the keyless path), the build falls back to the committed snapshot of the same table in
`packages/stats-nz/src/fixtures/`.

The code-to-label mapping is pinned in `sheep-data.ts` and was verified against published Stats
NZ figures (49.5m sheep in 1994, 32.6m in 2010, 23.3m in 2025). The proper codelist endpoint
(`/codelist/...`) requires a free subscription key, so the mapping gets replaced by a live
codelist fetch once `STATS_NZ_SUBSCRIPTION_KEY` is set.

## Verdict

**alive** — the data is real and the numbers are exactly the surprising story the pitch
promises. The page refreshes on each deploy rather than on each request.

## What it looks like

Four stat cards (sheep now, peak flock, change since peak, back in 1994) above an SVG line
chart of the full national series, with a data-source footnote.
