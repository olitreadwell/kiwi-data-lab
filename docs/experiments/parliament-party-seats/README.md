# Parliament party seats

Which party held the most seats at every election since 1935, plus a share-of-the-house
stacked area chart with the prime minister of each era overlaid.

- **Published at:** `/politics/parliament-party-seats/`, as a microsite in the `MICROSITES`
  registry (category "Politics & government", slug `politics`). It started life as a route
  under `/experiments/parliament-party-seats/`, which now redirects to the microsite.
- **Data:** New Zealand Parliament, Members of Parliament - Member Terms, served through the
  data.govt.nz CKAN datastore (resource `9767376e-ead0-468d-8b55-a65dfb629b54`).
- **Window:** the 25th Parliament (1935, the first Labour government) to the 54th (2023). The
  party buckets are Labour, National, Green, NZ First and ACT, which only describe the
  Labour / National era; earlier parliaments were run by the Liberals, Reform and United.
- **Seats:** a seat is counted once per member elected at that parliament's general election
  (`Method_of_Election = "General election"`, deduplicated by `MemberID`). Counting every
  Member Terms row instead inflates the totals, because by-elections, list replacements and
  mid-term changes of affiliation all add rows.
- **Status:** live. Build fetches the datastore and falls back to the committed snapshot at
  `apps/web/src/lib/fixtures/mp-member-terms.json` if the API is unreachable. The page says
  which of the two it used, and the snapshot is parsed by the same code as the live payload.
  Refresh it with `node scripts/refresh-parliament-fixture.mjs`.
- **Notes:** the party with the most seats is not always in government: in 2017 National won
  56 seats and Labour formed the government, the only time that has happened since 1935. So
  the government-change flags are curated from election results. The datastore labels the 1935
  coalition members as National; the National Party was formed the following year.
- **Prime minister band:** the names in the top band are fitted to the band's own pixel width,
  falling back to `First +N`, then to the first surname, then to nothing. The two most recent
  bands (2017-2023, 2023-2027) are the narrowest, and the government-change flag takes about
  13px off the end of any band that finishes on one. Checked in the browser at 375, 768, 900,
  1024, 1280 and 1512px: every band names its prime ministers from 900px up, and below that the
  recent bands drop out and the legend below the chart carries them.
