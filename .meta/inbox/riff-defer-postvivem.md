# /riff and /defer — Postvivem

Session: 2026-05-21, chipper project (riff/demo-task-sentence branch)

First deliberate dogfood of both skills. This document captures what
happened, what worked, what surprised us, and what's unresolved. Intended
as input for a /draft session to produce skill.md files.

---

## What we built

Branch `riff/demo-task-sentence` on chipper. 4 commits + 1 review commit:

1. `dateExpression` input type + meeting demo sentence
2. `contingentOn` shorthand, auto-indent lines, dormant clause display
3. Theme toggle sentence (praxis, midnight, terminal)
4. Review fixes (strict date validation, dormant visibleChips, display bugs)

Plus .meta artifacts: `tracks/riff-demo-task-sentence.md`, `roadmap.md`,
6 decisions logged, logical-architecture.md updated.

## /riff — what worked

### Tracks as conversation artifacts

The track file (`tracks/riff-demo-task-sentence.md`) served the same role
as a design doc in /draft — the thing we iterate on, not a summary. Phil
edited in the IDE, Claude updated from the CLI. Same inline-annotation
workflow, lighter format.

6 notes accumulated organically:
1. dateExpression input type (shipped)
2. day-of-month vs full calendar date (design discussion → deferred)
3. contingentOn presence shorthand (shipped)
4. line-level vs clause-level optionality (design note → shipped)
5. dormant clause display (design note → shipped)
6. theme toggle sentence (shipped)

Each note was iterated on in place, then frozen when we moved on. The
append-forward model held — we never went back to revise a played note.

**Retro refinement:** Tracks are design scratchpads, not session logs.
Bug fixes (e.g., numericExpression empty string validation) felt misplaced
in the track — they weren't iterated on, just fixed. Git log with good
commit messages is the session log. Tracks should only contain things that
need back-and-forth iteration between Phil and Claude.

### Note-before-code protocol

Discovered mid-session when Claude proposed a design (contingentOn
shorthand) and implemented it in the same breath. Phil corrected: "you
should still wait for me to sign off on the note before writing code."

This is the key guardrail that distinguishes /riff from cowboy coding.
The note is the lightweight equivalent of a /draft — skipping the approval
step defeats the purpose. The protocol:

1. Write the note to the track
2. Wait for Phil to annotate/approve
3. Build

For trivial items (bug fixes, one-line changes), the note can be written
after the fact. The threshold: "does this change behavior or introduce a
concept?" If yes, note first.

### SII loop as iteration engine

Visual changes (theme toggle, dormant clause display) used the screenshot
loop: SII → tweak → rebuild → SII. Non-visual changes (contingentOn
shorthand, dateExpression) used test/verify loops. Both converged quickly.

### Scope stayed contained

Multiple items exceeded riff scope and were cleanly deferred:
- Keyword grouping across popup types
- Context-aware punctuation
- Time picker chip design
- Theming engine v2

Each was deferred with provenance (which note surfaced it) and trigger
conditions (what would cause us to pick it up).

## /riff — what surprised us

### The branch prefix question was more interesting than expected

`feature/` felt wrong for a grab bag. `lr/` (lightning round) was the
inertia choice but the name didn't fit. Deliberate naming session produced
`riff/` — musical improvisation within structure. The naming process itself
was useful input for the skill: the name should encode the mode's character.

### Tracks are siblings of designs, not children

Initially unclear whether tracks should nest under designs. The answer was
clear once articulated: designs are durable architecture, tracks are
ephemeral session logs. Different lifecycle, different purpose, sibling
directories.

### Roadmap emerged as a natural /defer destination

The concept of a roadmap.md wasn't planned — it emerged when we needed
somewhere to put deferred items that weren't in-progress and weren't
designs. The roadmap fills a gap: "decided it matters, not happening yet."
`/hello` should read it. `/defer` should write to it.

## /defer — what worked

### Deferral with provenance

Each roadmap item says where it came from and what would trigger picking
it up. This makes the roadmap actionable, not just a wish list.

### Clean escalation from riff to defer

The day-of-month keyword grouping problem was the test case. Surfaced in
note 2, discussed in the track, explicitly deferred when it clearly
exceeded riff scope. The escape hatch worked as designed.

### Multiple deferrals in one session

5 items deferred across the session. The overhead was low — writing a
roadmap entry takes 30 seconds. The discipline of naming the trigger
condition forces clarity about why we're deferring.

## Open questions for skill design

### /riff

- **Track creation timing.** First /riff invocation in a session creates
  the track. But what if the user /riffs multiple times on different
  topics? One track per branch? One track per /riff invocation?
  - This session used one track for the whole branch. That felt right —
    the track is the branch's working log.

- **Interaction with /review.** This session ran /review manually before
  merge. Should /riff remind about /review? Auto-invoke it?
  - Probably just remind. /review is already non-negotiable per WORKFLOW.md.

- **Note approval threshold.** When does a change need a note-before-code
  vs. just doing it? The heuristic from this session: "does it change
  behavior or introduce a concept?" Needs refinement.

- **Punch list mode.** This session was effectively a punch list. The
  track accumulated items naturally. Should /riff support explicit punch
  lists, or are they always emergent?

### /defer

- **Destination argument.** `/defer roadmap` vs `/defer philset` vs just
  `/defer` (infer destination from context). This session deferred to the
  local roadmap.md. Cross-project deferral (routing to philset inbox) was
  discussed but not tested.

- **Relationship to /route.** Phil speculated about a general `/route`
  skill for moving items between project inboxes. /defer might be a
  special case of /route where the destination is always the roadmap.

- **Roadmap format.** The current format (grouped by category, each item
  with provenance and trigger) worked well. Should this be formalized in
  a reference doc?

## Metrics

- Session duration: ~3 hours
- Commits: 4 feature + 1 review
- Lines changed: ~770 added, ~69 removed
- Items shipped: 6 (dateExpression, contingentOn shorthand, auto-indent,
  dormant display, theme toggle, several bug fixes)
- Items deferred: 5
- Notes in track: 6
- Decisions logged: 6
- /review findings: 3 bugs, 2 improvements, 4 nits (all fixed)
