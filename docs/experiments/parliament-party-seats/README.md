# Parliament party seats

Which party held the most seats at every election since 1984, plus a share-of-the-house
stacked area chart with the prime minister of each era overlaid.

- **Data:** New Zealand Parliament, Members of Parliament - Member Terms, served through the
  data.govt.nz CKAN datastore (resource `9767376e-ead0-468d-8b55-a65dfb629b54`).
- **Status:** live. Build fetches the datastore and falls back to a committed snapshot if the
  API is unreachable.
- **Notes:** the party with the most seats is not always in government (1996, 2017), so the
  government-change flags are curated from election results.
