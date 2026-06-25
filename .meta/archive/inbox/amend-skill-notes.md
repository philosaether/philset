# Notes toward an `/amend` skill

Captured 2026-06-25 from the aether project, where the "amend an accepted
design" pattern was improvised for the **second** time. Input for formalizing
a real skill — this is the observed process, not a spec.

## The gap it fills

`/ship` marks a design `accepted`. `/draft`→`/ship` handles *new* designs and
supersession. But there's no first-class move for: **an accepted design's
reasoning needs updating, without superseding it.** The doc is still correct
in structure and decision — new information just refines part of it. Rewriting
it loses the decision history; superseding it is too heavy (the design didn't
change, its cost/constraint reasoning did).

## The improvised process (what I actually did)

1. Keep the accepted doc's `Status: accepted` and original body **intact** —
   never edit the existing prose.
2. Append an **`## Amendments`** section at the end (append-only, like
   `decisions.md`).
3. Each amendment entry:
   - dated heading (`### 2026-06-25 — <what changed>`)
   - what new information/work triggered it (link the source design/assessment)
   - the refined reasoning, written as a *layer on top of* the original
     (reference the original sections by number, e.g. "§4 ceiling still holds,
     but…"), not a rewrite
   - an explicit **"Unchanged:"** line listing what the amendment does *not*
     touch — so a reader knows the blast radius
4. Log a one-line entry in the project `decisions.md` noting the amendment and
   that the design was amended (not superseded).

## This session's worked example

`aether/.meta/designs/pricing.md` (accepted 2026-06-18). The migration-flow +
matcher designs changed how *build cost* works (deterministic matcher offloads
the bulk; sampling bounds review). The pricing **structure** (tiers, gates,
ceiling) was unchanged — only the build-cost reasoning needed updating. So:
appended an `## Amendments` section with the re-estimate (~$2–6/site), what
cracked vs. held per original section number, and an explicit "Unchanged:"
list. Original design untouched; `decisions.md` logged the amendment.

## Open questions for formalization

- **Trigger detection:** like `/defer`, should the agent recognize amendment
  intent ("this updates our pricing assumption but doesn't change the design")
  and self-invoke? Or always user-invoked?
- **vs. supersede:** the decision rule seems to be — *amend* when the doc's
  decision/structure stands and only supporting reasoning shifts; *supersede*
  when the decision itself changes. Worth stating explicitly in the skill.
- **vs. a new decisions.md entry:** an amendment is heavier than a decision log
  line — it lives *in* the design so future readers of that doc see it inline.
  When is a `decisions.md` line enough vs. a full amendment? (Heuristic: if a
  future reader of the *design* would be misled without it → amend.)
- **Index signal:** should `designs/index.md` show an "amended <date>" marker
  so amendments are discoverable without opening the doc?
- **Format home:** the `## Amendments` + dated entries + "Unchanged:" line
  format above worked well twice; consider making it the canonical template.

This is the second improvisation of essentially the same shape — strong signal
it's ready to formalize.
