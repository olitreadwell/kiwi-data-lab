import { Container, Stack } from '@kiwilab/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - kiwi-data-lab',
  description: 'What kiwi-data-lab is, where the data comes from, and how the site is built.',
};

export default function AboutPage(): React.ReactElement {
  return (
    <Container size="wide">
      <Stack className="max-w-3xl gap-6 py-[var(--spacing-2xl)]">
        <h1 className="numeral-heading-3xl">About kiwi-data-lab</h1>
        <p className="numeral-paragraph-lg text-[var(--color-muted)]">
          Small experiments digging through New Zealand public data for the funny and the
          surprising. One experiment at a time, each on a real dataset.
        </p>

        <section className="space-y-3">
          <h2 className="numeral-heading-lg">nz-open-data-connectors</h2>
          <p className="numeral-paragraph-md">
            The data here is pulled through{' '}
            <Link
              href="https://github.com/olitreadwell/nz-open-data-connectors"
              className="underline hover:text-[var(--color-fg)]"
            >
              nz-open-data-connectors
            </Link>
            : TypeScript connectors for New Zealand public data, keyless-first, with
            language-agnostic wrappers so any language can call them. There is an HTTP API with an
            OpenAPI spec, an nzdata command line tool that prints JSON or CSV, and Python and Ruby
            ports. Every connector works without an API key; optional keys unlock more and stay
            server-side, read from the environment and never exposed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="numeral-heading-lg">New Zealand Data &amp; APIs</h2>
          <p className="numeral-paragraph-md">
            When a new source is needed, it usually starts in{' '}
            <Link
              href="https://github.com/olitreadwell/new-zealand-data"
              className="underline hover:text-[var(--color-fg)]"
            >
              olitreadwell/new-zealand-data
            </Link>
            , a community list of New Zealand data and available APIs, from central government
            agencies to local councils, published as a searchable site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="numeral-heading-lg">The sheep index</h2>
          <p className="numeral-paragraph-md">
            The sheep index tracks the national sheep flock. It has nearly halved since 1994, from
            49.5 million sheep to 23.3 million by 2025. The real peak came earlier: in 1982 New
            Zealand counted 70 million sheep, more than 20 for every person.
          </p>
          <p className="numeral-paragraph-md">
            The series comes from the Stats NZ Aotearoa Data Explorer (table AGR_AGR_003, Livestock
            Numbers by Regional Council). It's fetched at deploy time, with a committed snapshot as
            fallback when the API blocks the build runner. The site redeploys daily.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="numeral-heading-lg">How the site works</h2>
          <p className="numeral-paragraph-md">
            A static Next.js export. Data is fetched at build time, so every page is plain HTML with
            no server. Charts render in the browser from the same numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="numeral-heading-lg">Open source</h2>
          <p className="numeral-paragraph-md">
            The code is public on{' '}
            <Link
              href="https://github.com/olitreadwell/kiwi-data-lab"
              className="underline hover:text-[var(--color-fg)]"
            >
              GitHub
            </Link>
            . Found a bug or a broken link? Open an issue there.
          </p>
        </section>
      </Stack>
    </Container>
  );
}
