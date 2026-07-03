---
Status: accepted
Date: 2026-07-03
Accepted: 2026-07-03
Implemented: 2026-07-03 (feature/hey-minimal-tree-walk)
Divergences: none — all 5 planned skill.md changes landed as specced
Added-in-review: Step 0 orientation block (behavioral-rule parity with /hello — plan-override, auto-/retro//defer, cadence model; also absorbs the jargon gloss). DRY extraction of a shared orientation+walk snippet deferred to roadmap.
Assessment: none (sourced from live /hey→/hello compare-notes, this session)
Supersedes: none (edits skills/hey/skill.md in place)
---

# `/hey` Minimal Tree Walk — Desired State

Give `/hey` a **minimal** tree walk — signpost-flag inheritance + root
`WORKFLOW.md` — and nothing more. This fixes the two real gaps the first live
`/hey` exposed (no merge guardrail, broken config inheritance) without importing
the breadth of `/hello`'s Step 1, so the floor stays a floor.

---

## Problem (why)

The first real `/hey` (this session, in `philset/`) ran effectively
**unconfigured**, and both symptoms trace to one root cause: `/hey` skipped the
tree walk, and in `philset` the config *and* the user context live one level up.

1. **No merge guardrail.** `WORKFLOW.md` carries "explicit consent required for
   merging to main." `/hey` never reads it, so a floor session performed a
   high-consequence action (commit + merge to `main`) without the axiom that
   governs it ever being in context. It worked out only because the user gave an
   explicit instruction — the guardrail itself was absent.
2. **Broken config inheritance.** `philset/` has **no local `signpost.yml`** —
   `root`, `calendar`, `architecture`, `links`, `private-meta` all live in the
   root `~/Development/.meta/signpost.yml` and inherit *down*. No walk → no
   inheritance → every flag silently at its default. The floor wasn't just
   sparse; its configuration was inoperative.

Both are fixed by walking far enough to (a) merge signpost flags and (b) read the
root user context. Neither needs the rest of `/hello` Step 1.

## The minimal walk (what `/hey` gains)

A new sub-step in `/hey` Step 1. Precisely three things, in order:

1. **Walk up** cwd → root (stop at `signpost.yml` with `root: true`, or `~`).
2. **Merge signpost flags** at each level, child overrides parent — full
   inheritance (`architecture`, `calendar`, `private-meta`, `allow-plan`,
   `hello.check`, etc.). This makes `/hey` **config-aware**.
3. **Read the root `WORKFLOW.md`** (user context). This loads the merge guardrail
   and Phil's working preferences.

**Explicitly still excluded from the minimal walk** (these stay `/hello`-only,
reachable via auto-escalation):

- Intermediate **domain context files** (`conventions.md`, domain `roadmap.md`,
  domain `inbox/todo.md`).
- **Neighborhood / sibling scan.**
- **Quick-links persistence** to `breadcrumbs.log` (`links` are parsed as part of
  flag-merge, but not surfaced or written — available if the session escalates).
- **Aged-note surfacing**, **`logical-architecture.md` staleness check**,
  **scaffolding offers**.

## What stays `/hey` vs `/hello` after this change

The floor still holds — the walk is the *only* thing that moves. Remaining
differences:

| Dimension | `/hey` (post-walk) | `/hello` |
|-----------|-------------------|----------|
| Signpost inheritance + user context | **yes** | yes |
| Project-state read | `in-progress` + decisions **tail** | full: `roadmap`, `designs/index`, `study/`, `inbox/`, counts |
| `hello.check` (calendar/connectors) — **network** | **never** | per opted-in list |
| Scaffolding / arch / aged-notes / maintenance writes | **never** | yes |
| Neighborhood + intermediate domain reads | **no** (escalation only) | yes |
| Summary | one/two lines | full readout |

Net: after this change the principled `/hey`↔`/hello` line is **read-depth +
network + verbosity**, not "does it know who the user is / how it's configured."

## The network boundary (resolved)

Post-walk, `/hey`'s config pass *collects* `hello.check` (e.g. `[calendar]` in
`philset`) so downstream session skills can see it — but `/hey` itself **runs no
checks and surfaces nothing about them.** No calendar, no connector probe, no
"calendar enabled" nudge. Silent, not legible.

**Rationale (Phil):** `hello.check` simply isn't `/hey`'s concern — `/hey` runs no
checks, full stop. If you type `/hey` and miss a meeting or a train because the
calendar didn't surface, that's on you: that's the deal you opt into by choosing
the offline floor. A nudge would re-litigate that boundary every single session
for no gain.

(Rejected: the config-aware one-liner from the first draft. It made the exemption
*legible*, but that treats a deliberate, user-accepted omission as something that
needs explaining — the omission is the whole point of the floor.)

## Concrete `skill.md` changes (`skills/hey/skill.md`)

1. **Frontmatter `description`** — replace "no tree walk, no MCP/API reads" with
   "minimal tree walk (signpost inheritance + user context), still offline — no
   full state read, no network." Keep the auto-escalation clause.
2. **Step 1** — prepend the minimal-walk sub-step (the 3 items above) before the
   local `.meta/` read. Keep the local read as-is. Frame the flag-merge as a
   **config pass**: it collects *all* signpost flags (incl. `private-meta`,
   `hello.check`) into session config so downstream skills are aware — even though
   `/hey` itself acts on none of them.
3. **The "Do NOT" block** — rewrite. *Remove* "walk the signpost tree, read
   parent/root context, read `WORKFLOW.md`" (now baseline). *Keep* the network
   prohibition. *Add* the breadth exclusions (no neighborhood scan, no
   intermediate domain/roadmap reads, no quick-links persistence, no
   scaffolding/arch/aged-notes) **and** make explicit that `/hey` runs and
   surfaces **no** `hello.check` entries — collects the flag, acts on none, says
   nothing.
4. **Step 2 (summary)** — stays a terse one/two-liner. **No** `hello.check` line
   (this reverses the first draft's proposed nudge).
5. **Step 3 (escalation gate)** — signpost-inheritance + user-context are no
   longer escalation triggers (they're baseline). The triggers that remain:
   intermediate **domain** context, neighborhood/cross-project, full project
   state, `logical-architecture.md`. `hello.check` stays network-exempt exactly
   as written.

## Tradeoffs

- **Minimal walk vs. full walk.** Full walk (all of `/hello` Step 1) would
  collapse `/hey`↔`/hello` almost entirely and re-import the breadth (neighborhood,
  intermediate roadmaps, quick-links writes) that defines the floor. **Chosen:
  minimal** — it fixes both named problems (guardrail + config) and nothing else.
  Revisit if real use shows `/hey` sessions constantly escalating for domain
  context (would argue for pulling one more layer down).
- **Network nudge: one-liner vs. silent. Chosen: silent** (2026-07-03, Phil).
  `/hey` runs no checks and says nothing about them. A nudge would explain a
  deliberate, user-accepted omission every session — re-litigating the floor's
  whole premise. Typing `/hey` *is* the choice to go without the calendar; a
  missed meeting sits with that choice, not the tool. Revisit only if silence
  itself is shown to cause real confusion (unlikely — the omission is the point).
- **Quick-links: persist vs. skip.** `/hello` writes them to `breadcrumbs.log` to
  survive compaction. **Chosen: skip** for `/hey` — persistence is a maintenance
  write, and a short floor session rarely compacts. Links remain parsed and
  in-context; escalation persists them if needed.

## Open Questions (all resolved 2026-07-03)

1. ~~**Exact wording / trigger of the network one-liner.**~~ **RESOLVED: no
   one-liner.** `hello.check` is not `/hey`'s concern — it runs no checks and
   surfaces nothing. See "The network boundary" section.
   - Phil: hello.check[] is just not relevant to hey
   - i.e., hey runs no checks
      - If the user forgets a meeting or misses their train because they typed /hey that morning, that's on them
2. **Does the minimal walk read intermediate-level `WORKFLOW.md` if one exists**
   (not just root)? `/hello` reads user context at root only; domains carry
   *conventions*, not `WORKFLOW.md`. Leaning: root-only, matches `/hello`.
   - Root only; no support for domain-level WORKFLOW.md at this time
3. **`private-meta` interaction** — inheriting `private-meta: true` is pure config
   (no behavior in `/hey` itself). Confirm nothing in the floor acts on it. Likely
   a no-op, noting for completeness.
   - no impact on /hey, but must be collected during the config pass so other skills in the session are aware

## Out of Scope

- Any change to `/hello` — this only touches `skills/hey/skill.md`.
- Full project-state read, scaffolding, `logical-architecture.md` handling,
  aged-note surfacing — all stay `/hello`-only.
- **Running** any `hello.check` from `/hey` — the network exemption is unchanged;
  we only make it *legible*.
- Neighborhood/sibling awareness and intermediate domain reads — escalation-only,
  unchanged.
- The `/draft`-under-`/hey` escalation-trigger question — the user is content with
  how that grey area resolved; not part of this change.
