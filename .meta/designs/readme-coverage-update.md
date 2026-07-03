---
Status: accepted
Date: 2026-07-03
Accepted: 2026-07-03
Assessment: none (punch-list sourced from roadmap "README update — cover changes since the voice pass")
Supersedes: none (edits README.md in place)
Implementer: Phil (human-as-implementer; /review compares the artifact regardless)
---

# README Coverage-Update — Desired State

Bring `README.md` current with everything shipped since the voice pass. The
prose voice is already right ("for-humans" goal met); what's stale is
**coverage** — the README documents roughly half the current library and
predates the altitude model. This changeset adds the missing skills, reframes
the two flat cadence tables around the gradient of iteration altitudes, corrects
the now-stale `/review` description, and adds three positioning pieces (non-code,
human-as-implementer, external-writes-through-inbox).

**Scope discipline:** this is a *coverage* pass, not a voice rewrite. New prose
matches the existing essay voice but Phil owns the final voice polish. We add
structure and accurate content; we don't re-author what already reads well.

---

## What's stale (gap inventory)

Current README skill coverage vs. shipped library:

| Section | README today | Missing |
|---------|-------------|---------|
| Workday cadence | `/hello`, `/ttyl` | `/hey` |
| Lifecycle cadence | `/assess`, `/draft`, `/ship`, `/review` | `/riff`, `/amend`, `/defer`, `/triage` |
| Improvement | `/retro` | `/study` (its own altitude, not "improvement") |

Non-skill gaps:
- `/review` copy is **wrong now** — says it "runs six parallel analyses" with a
  fixed list (efficiency, redundancy, bugs, architecture, design fidelity, merge
  readiness). Dimensions are now **configurable** (signpost `review.dimensions` /
  `extra-dimensions` → inferred → ask) with only the **structural** ones
  (design / track / merge reconciliation) always-on.
- No **non-code positioning** anywhere.
- `/ship` section omits the **human-as-implementer** note (design doc = spec;
  `/review` compares the artifact regardless of who built it).
- No statement of the **"external writes go through inbox"** principle.
- Config section (`signpost.yml`) lists `root`, `name`, `architecture`,
  `allow-plan`, `private-meta`, `links` — but not the two new per-skill config
  keys: `review.dimensions` and `hello.check`.

Already landed (verify, don't re-add): `private-meta` / `philset private` (v0.3
Target 1) — present and correct in Install/Usage.

---

## Change 1 — Reframe the cadence tables around the altitude gradient

The two flat tables ("Workday Cadence", "Lifecycle Cadence") currently imply the
library is ~7 skills in two buckets. The real mental model — from the
`philset-development-state` assessment — is a **gradient of iteration-loop
altitudes**: the heavier the change, the higher the ceremony.

```
mechanical  →  riff  →  amend  →  draft  →  study
 (commit)     (track   (design   (design    (durable
              note)    tweak)    doc)       learning)
```

Add a short framing paragraph introducing this gradient, then let the lifecycle
table carry the altitude column. Concretely:

- Keep the **Workday cadence** table (session-level: how a day opens/closes) but
  add `/hey` as the light floor beneath `/hello`, and note `/retro` belongs to
  the workday close (it's currently stranded in its own trailing section).
- Reframe the **Lifecycle cadence** table as an **altitude ladder**, adding the
  missing rungs. Proposed rows (in altitude order):

  | Skill | Altitude | Purpose |
  |-------|----------|---------|
  | `/riff` | lightweight iteration | Grab-bag branch work with a track note; note-before-code, `/defer` as the escape hatch |
  | `/assess` | orient | Structured snapshot of a feature/system/area — grounds the design in reality |
  | `/draft` | design | Working design document for maximal-iteration alignment |
  | `/amend` | design tweak | Scoped addition to an *accepted* design without superseding it |
  | `/ship` | implement | Accept the design, archive superseded docs, build from a trusted spec |
  | `/review` | pre-merge | Diff vs. main across resolved + structural dimensions; design/decision reconciliation |
  | `/study` | learn | Staged source-grounded learning (write→annotate→quiz→score); durable, citable doc |

  (`/defer` and `/triage` are backlog-management, not lifecycle rungs — see
  Change 2.)

**Open fork:** one unified ladder table vs. keeping Workday and Lifecycle
separate with the altitude framing added. Leaning: keep them separate (they *are*
two orthogonal cadences — that framing is a strength of the current README), just
fill the gaps and add the altitude column to the lifecycle one.

## Change 2 — Add the backlog-management skills (`/defer`, `/triage`)

These don't sit on the feature-lifecycle ladder; they manage the flow of *future*
work. Add a short subsection (under the `.meta/` / state-tracking area, near
`inbox/`) covering:

- `/defer` — capture future work with provenance, route it to the right project's
  roadmap (curated backlog) or inbox `todo.md` (staging).
- `/triage` — the gate between staging (`todo.md`) and committed backlog
  (`roadmap.md`).
- The item lifecycle: `todo.md` (inbox) → `roadmap.md` (curated) →
  `archive/rearview.md` (graveyard); graduation on merge.

This is also the natural home for the **"external writes go through inbox"**
principle (Change 5).

## Change 3 — Correct the `/review` description

Replace the "six parallel analyses" sentence with the accurate model:

- `/review` resolves its review **dimensions** for the medium — from signpost
  `review.dimensions` / `extra-dimensions`, else inferred from the medium (code
  default: bugs / efficiency / redundancy / architecture), else asks.
- It **always** runs the structural dimensions: design fidelity, track
  reconciliation, merge readiness (decision-conflict check against `main`).
- Findings are presented for approval before committing.

Keep the existing "conflicts of intent against `main`" paragraph — that's still
accurate and is one of the README's strongest selling points.

## Change 4 — Non-code positioning section

New section (short — a few paragraphs). philset works for non-code artifacts, not
just codebases:

- Which skills are **concept-general** already: `/draft` scopes any artifact
  (READMEs, case studies, essays); `/study` masters any primary source.
- The **`architecture: false`** signpost flag as the sanctioned non-code escape
  hatch — turns off the codebase-map expectation.
- The honest caveat: **`/review`'s default dimensions are code-shaped** (bugs,
  efficiency). A writer wants prose review — that's what `review.dimensions`
  configurability is for, and the deeper prose-generalization is on the roadmap
  (gated on real feedback).
- Pointer to the future **git-setup tutorial** for non-devs (git stays; a guided
  ramp, not skill surgery) — mark as coming, don't over-promise.

## Change 5 — `/ship` human-as-implementer note

Add to the `/ship` section (from `inbox/human-implements.md`): the assess → draft
→ ship → review loop works **even when the human does the implementation**, not
Claude. The design doc is the spec; `/review` compares the *artifact* against it,
regardless of who built it. (Real example available: the LinkedIn branding
session — Phil implemented while Claude reviewed against the design doc.)

## Change 6 — Update the `signpost.yml` config block

Add the two new per-skill config keys to the example + field list:

```yaml
review:
  dimensions: [bugs, prose]     # override /review's inferred dimensions
  extra-dimensions: [security]  # add to the inferred set
hello:
  check: [calendar, connectors] # optional session-start checks (default: none)
```

Note the emerging **per-skill config convention** (structured signpost keys a
skill reads to self-configure) — `review.dimensions` and `hello.check` are its
first two consumers.

---

## Proposed prose (first-pass — Phil polishes)

README-ready text for each change, in the existing essay voice. Drop-in
candidates; wording is Phil's to finalize.

### Change 1 — altitude framing + tables

Framing paragraph (insert before the cadence tables, introducing the model):

> Not every change deserves a design doc. `philset` sorts work by **altitude** —
> the higher the stakes, the higher the ceremony. A typo is a commit. A quick
> experiment is a track note. A new subsystem is a design doc you'll iterate on
> for an hour before a single line is written. The skills below are that ladder,
> from the ground up.
>
> ```
> mechanical  →  riff  →  amend  →  draft  →  study
>  a commit     a track    a design   a design   durable
>              note        tweak      doc        learning
> ```

Workday cadence table (add `/hey`; note `/retro` at close):

> | Skill | Purpose |
> |-------|---------|
> | `/hey` | The light floor: loads local context only, gets you moving fast |
> | `/hello` | The full orient: walks the context tree, reads state, summarizes |
> | `/retro` | End-of-day calibration — teaches Claude to work better *with you* |
> | `/ttyl` | Persists decisions and progress so tomorrow picks up cleanly |

Lifecycle cadence table (the altitude ladder — add `/riff`, `/amend`):

> | Skill | Altitude | Purpose |
> |-------|----------|---------|
> | `/riff` | iterate | Grab-bag branch work with a track note — note before code, `/defer` to escalate |
> | `/assess` | orient | A structured snapshot of what exists, works, and is broken |
> | `/draft` | design | A working design document, built for maximal iteration |
> | `/amend` | adjust | A scoped addition to an accepted design, without superseding it |
> | `/ship` | build | Accept the design, archive what it supersedes, implement from a trusted spec |
> | `/review` | merge | Diff against `main`, reconcile decisions, catch what the spec missed |
> | `/study` | learn | Staged, source-grounded learning that actually sticks |

### Change 2 — `/defer` + `/triage` subsection

New subsection near the `.meta/`/inbox material:

> ### Nothing gets lost, nothing gets forced
>
> Good ideas arrive at bad times. When a thought is bigger than the current
> session, `/defer` catches it — with provenance intact — and routes it to the
> right place: a project's `roadmap.md` when it's real, committed backlog, or the
> `inbox/todo.md` staging area when it's still raw. Later, `/triage` is the gate
> between the two: it processes staged items into the curated roadmap, or resolves
> them on the spot. Work flows `todo.md` → `roadmap.md` → done, and graduates to
> the rearview when a branch that closes it merges.
>
> The same principle governs anything from outside the session: **external input
> comes in through the inbox.** Drop a file, a screenshot, a stray note into
> `inbox/`, and it waits there to be triaged rather than interrupting the work in
> flight.

### Change 3 — `/review` correction

Replace the "six parallel analyses" sentence:

> `/review` diffs the branch against `main` and checks it along the dimensions
> that matter for *this* medium. For code, that means bugs, efficiency,
> redundancy, and architecture — but those aren't hard-coded: a repo can declare
> its own review dimensions in its signpost (a prose project might ask for clarity
> and tone instead), and Claude infers sensible defaults when you don't. On top of
> whatever dimensions apply, `/review` always runs the **structural** checks —
> design fidelity, track reconciliation, and merge readiness — then presents its
> findings for your approval before anything is committed.

(Keep the existing "conflicts of intent against `main`" paragraph as-is.)

### Change 4 — non-code positioning

New section (proposed header keeps the aphorism style):

> ## Not just for code
>
> Nothing about a design loop is inherently about software. `/draft` scopes any
> artifact you'd want to get right before building — a README, a case study, a
> launch plan. `/study` masters any primary source, not just a codebase. If your
> work isn't code at all, set `architecture: false` in your signpost and philset
> drops the codebase-map expectation entirely.
>
> One honest caveat: `/review`'s default dimensions are code-shaped — bugs and
> efficiency don't mean much for an essay. That's exactly what configurable review
> dimensions are for (declare `prose` and Claude reviews for clarity instead), and
> deeper non-code support is on the roadmap, driven by what real writers actually
> ask for rather than what we guessed. If git itself is the barrier, a guided
> setup flow for non-developers is coming — philset keeps git, but it shouldn't
> assume you already speak it.

### Change 5 — `/ship` human-as-implementer note

Add to the `/ship` section:

> And it works even when *you're* the one building. The design doc is the spec, not
> a set of instructions only Claude can follow — so the loop holds whether Claude
> writes the code or you do. Draft the spec together, implement it yourself, and
> `/review` still compares the finished artifact against what you agreed to build.

### Change 6 — signpost config

Add to the `signpost.yml` example block and field notes:

> ```yaml
> review:
>   dimensions: [bugs, prose]     # override /review's inferred dimensions
>   extra-dimensions: [security]  # add to the inferred set
> hello:
>   check: [calendar, connectors] # optional session-start checks (default: none)
> ```
>
> These are the first of philset's **per-skill settings** — structured signpost
> keys that a single skill reads to configure itself. `review.dimensions` tells
> `/review` what to look for; `hello.check` tells `/hello` which optional
> start-of-session checks to run.

---

## Tradeoffs

- **Unified ladder vs. two cadence tables** (Change 1). A single altitude ladder
  is conceptually cleaner but collapses the orthogonal-cadences framing that
  currently makes the README click. Rejected in favor of keeping both tables and
  adding altitude framing — revisit if the two-table version reads as padding
  once `/hey` and the four new rungs are in.
- **How much non-code to promise** (Change 4). Could write a full non-code
  onboarding path, but the roadmap is explicit that deep generalization is
  *gated on real feedback* — over-promising invites exactly the code-shaped
  friction (`/review`) we haven't fixed. Chose an honest, caveated section over
  an aspirational one. Revisit when a real non-code user shows up.
- **Include `hello.check` at all** (Change 6). It shipped documented-but-mostly-
  inert (Phase 0). Documenting an inert-ish knob risks confusion. Chose to
  include it because it's real signpost surface and pairs with `review.dimensions`
  to name the per-skill-config convention — but keep the description one line.
- **Coverage-only vs. touch the voice** (whole doc). Tempting to smooth prose
  while we're in here, but the item is explicitly Phil-solo voice work. Chose to
  land accurate *content* and leave voice polish to Phil — avoids stepping on the
  one part that's already done.

## Open Questions

1. **One ladder table or two cadence tables?** (Change 1 fork.) Recommendation:
   two. Confirm.
2. ~~**Does this changeset gate the v0.3 cut, or fast-follow it?**~~ **RESOLVED
   2026-07-03: it GATES the cut.** The tag waits on this README landing, so `/hey`
   and configurable `/review` ship documented.
3. ~~**Does Phil want to author the new prose, or should I draft prose?**~~
   **RESOLVED 2026-07-03: Claude drafts first-pass prose, Phil polishes.** See the
   "Proposed prose" section below.
4. **`/hey` depth in the README.** One line under `/hello` (light local floor), or
   does the progressive-disclosure framing (self-calibration; plugin-floor/
   MCP-ladder) warrant its own mention? Leaning: one line now — the disclosure
   framing is mostly deferred (Phases 1–3), so don't document unshipped surface.

## Out of Scope

- **Voice rewrite** of existing sections — the voice pass is done.
- **Deep non-code generalization** — Tier 3, gated on feedback. Change 4 only
  *positions*; it doesn't build.
- **The git-setup tutorial** — its own `/draft`, post-cut. Change 4 only points
  at it.
- **`anecdotes.md`** content — case-study material, not README-structural.
- **The v0.3 version bump / tag / publish** — that's the release cut, a separate
  step (this changeset is a prerequisite candidate, not the cut itself).
- **Progressive-disclosure Phases 1–3** — unshipped; don't document.
