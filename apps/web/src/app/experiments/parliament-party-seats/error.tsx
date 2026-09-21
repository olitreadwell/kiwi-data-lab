'use client';

import { Container, Section } from '@nzlab/ui';

/** Error boundary for the parliament page, so a data failure takes down one page only. */
export default function ParliamentPartySeatsError(): React.ReactElement {
  return (
    <Section>
      <Container>
        <h1 className="numeral-heading-2xl">Parliament data did not load.</h1>
        <p className="numeral-paragraph-md mt-2 text-[var(--color-muted)]">
          The seat counts could not be fetched. Try again later.
        </p>
      </Container>
    </Section>
  );
}
