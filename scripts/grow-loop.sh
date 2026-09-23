#!/bin/bash
# Thin entrypoint for the NZ data lab grow loop.
# Shared logic lives in code/usa-uk-data-stack/loops/loop-wrapper.sh.
# Arguments after the loop name are passed through, so `--dry-run` reaches
# the wrapper's preflight instead of starting a real session.
exec "$HOME/code/usa-uk-data-stack/loops/loop-wrapper.sh" \
  "$HOME/code/nz-data-lab" \
  "$HOME/code/nz-data-lab/scripts/grow-loop-prompt.txt" \
  "$HOME/code/nz-data-lab/scripts/heal-grow-loop-prompt.txt" \
  nz-data-lab "$@"
