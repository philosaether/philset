# Multi-stage /ship

Dropped from meta/ (linkedin-branding session, 2026-05-04).

## Problem

The linkedin-branding branch has two designs that were both `/ship`ped in
the same session, but neither is fully implementable in one pass. Phil's
profile was partially live before the design was accepted (retroactive
ship). Ronique's profile is being updated incrementally — experience
entries now, summary later (waiting on voice pass), media later still.

The current `/ship` assumes: accept design → implement → done. But some
features ship in stages:
- Ship what you can now, block on external input
- Ship a v0.1, iterate to v1 in a later session
- Ship the design as "accepted" but implementation is spread across
  multiple sessions

## Observed friction

- Phil shipped the design retroactively after already implementing half
  of it. Felt awkward — "I should have waited for /ship."
- Ronique's profile is accepted but only partially implementable. The
  design doc's open questions and media wishlist are blockers for specific
  sections, not for the whole thing.
- `/ship` currently has one state: accepted. There's no way to say
  "accepted, partially shipped, blocked on X."

## Possible approaches

- **`/ship --provisional`** or **`/ship --partial`**: Accept the design,
  begin implementation, but mark it as incomplete. State files track
  what's blocked.
- **Iteration markers**: `/ship --iteration 1` (or `--it 1`). Each
  iteration ships a defined subset. The design doc tracks which iteration
  each section belongs to.
- **Just use in-progress.md**: Maybe the answer is that `/ship` doesn't
  change, and in-progress.md already handles "accepted but partially
  done." The friction was more about the retroactive accept than about
  missing tooling.
- **Retroactive ship**: `/ship --retroactive` or `/ship --bless` for
  when implementation preceded the formal accept. Might be overthinking
  it.

## Open question

Is this actually a /ship problem, or is it a workflow habit problem?
Phil noted he should have waited for /ship before building. If the
discipline is "don't build without /ship," then multi-stage is just
"ship, build what you can, update in-progress.md, pick up next session."
