# Assessment: philset Development State (inbox triage + high-impact areas)
Date: 2026-06-25
Branch: main

Scope: a grip on the accumulated inbox, a read on where the *emergent*
usage patterns diverge from the v0.2 design intent, resolution of
contradictory/outdated notes, and an honest assessment of multi-user
readiness — feeding an ordered set of high-impact work chunks.

---

## Current State

philset v0.2.x is a stable, dogfooded skills library. Nine skills are
shipped and in daily use across many projects (chipper, philbas.com,
aether, meta, WWTS, praxis, …): `/hello`, `/assess`, `/draft`, `/ship`,
`/review`, `/retro`, `/ttyl`, `/defer`, `/riff`. The two-cadence model
(hello/ttyl bookend the workday; draft/review bookend the feature) and
the `.meta/` tree with `signpost.yml` walk-up are working as designed.

The library has held up *remarkably* well under project types it was
never designed for: economics research, LinkedIn branding, interview
prep, public-facing copy. That durability is the good news. The friction
is that **usage has outgrown the original mental model in specific,
patterned ways**, and the backlog of process notes documenting that
drift has accumulated faster than we've processed it.

### Inbox inventory (17 items)

| File | Type | Disposition |
|------|------|-------------|
| `to-do.md` | canonical backlog | **Triage in place** — contains stale + contradictory items (see Contradictions) |
| `to-do-annex.md` | build/devex session modes | **Superseded by /riff** → archive |
| `amend-postvivem.md` | /amend evidence #1 (2026-06-10) | Consume into /amend draft |
| `amend-skill-notes.md` | /amend evidence #2 (2026-06-25, today) | Consume into /amend draft — improvised **twice**, ready |
| `staged-study-skill.md` | /study skill proposal | /draft when prioritized |
| `skill-todo-roadmap-integration.md` | close-the-loop automation | Theme A |
| `riff-postvivem-contact-form.md` | /riff dogfood (note-then-code default, push-scope) | Fold lessons into /riff, then archive |
| `riff-defer-postvivem.md` | /riff+/defer dogfood | **Consumed — skills shipped** → archive |
| `lightning-round-proposal.md` | /riff origin proposal | **Consumed — shipped** → archive |
| `workstream-switching.md` | /suspend design input | Theme B |
| `switch-requirements.md` | /suspend requirements (best articulation of thread-vs-project state) | Theme B |
| `multi-stage-ship.md` | /ship-variant open question | Likely resolve as "use in-progress.md"; low priority |
| `philset-mv.md` | `philset mv` utility command | Theme E (naming hygiene) |
| `human-implements.md` | README amendment (workflow is agent-agnostic) | Multi-user evidence; small |
| `anecdotes.md` | evidence collection | Keep as reference; not actionable |
| `readme-context.md` | README voice guidance | Consume when README is drafted |
| `standardize-archival.png` | SII — chipper `.meta/` showing `archive/designs`, `assessments/archive` | Theme A (archival standardization) |

---

## Emergent vs. Expected Patterns

The single most useful output of this triage. Five patterns recur across
unrelated projects — none of them were the patterns we designed for.

### 1. The lifecycle is a *gradient of altitudes*, not one pipeline
We designed one design-granularity: the full `/draft` doc. Reality
produced a spectrum of iteration weights, and we've been backfilling it
one skill at a time:

```
mechanical → riff → amend → draft → study
  (commit)   (track  (layer   (full   (learn an
             note)   on doc)  doc)    external system)
```

`/riff`, `/amend`, and `/study` are all "the design loop at a different
altitude." **philset is becoming a library of altitude-appropriate
iteration loops, not a single assess→draft→ship pipeline.** Naming this
explicitly should drive how we frame the README and how we decide whether
a *next* proposal is a real gap or just an existing loop at a new
altitude.

### 2. We create artifacts well; we close their loops poorly
`decisions.md` was append-only *by design*. But the same "living,
append-only artifact" shape kept reappearing where we'd assumed
immutability:
- accepted designs accrete **amendments** (amend-postvivem, amend-skill-notes)
- roadmap/to-do items get **completed** but nothing graduates them (skill-todo-roadmap-integration)
- study docs accrete **quiz logs**
- consumed inbox items **never get cleared** (the pain you're feeling right now)
- archival conventions **vary per project** (standardize-archival.png)

Every skill is good at *opening* state; few close it. **This is the gap
that is actively generating the present chaos** — there's no loop-closing
machinery, so consumed items pile up. (The `/ttyl` enhancement to
auto-clean consumed inbox items is already sitting in `to-do.md` lines
67–72, unbuilt.)

### 3. State has two lifetimes, but `.meta/` only models one
`in-progress.md`, `breadcrumbs.log`, and `tracks/` are **branch/session-
volatile**. `decisions.md`, `roadmap.md`, `designs/` are **durable and
shared**. We built one `.meta/` as if everything had the same lifetime.
`switch-requirements.md` already articulates the fix precisely: a
per-branch **"thread"** (owns Active + breadcrumbs) vs. shared **project
state**. This is invisible friction today (solo, one branch at a time)
and a **hard blocker the moment two people share a repo** — branch-
volatile state in git-tracked files becomes merge conflicts.

### 4. Work routes *between* projects constantly
We expected work to stay in one project. Reality: cross-project `/defer`,
cross-project changelogs dropped in a consumer's inbox (riff-postvivem),
sessions that spawn new projects mid-flight (the `/bounce` proposal), and
the "external writes go through inbox" principle. philset is operating as
a **tree with traffic between nodes**, not isolated projects. The inbox
is already (accidentally) the right primitive: a concurrency-safe staging
area. That's worth making intentional.

### 5. The human is sometimes the implementer
`human-implements.md`: the pipeline is **agent-agnostic** — `/draft` is
the spec, `/review` compares artifact-to-spec regardless of who built it
(Phil updating LinkedIn while Claude reviewed PDFs). This is exactly the
property that makes philset teachable to teammates — and it's currently
undocumented.

---

## Contradictions & Outdated Notes (resolve these)

- **ttyl should commit.** `to-do.md` lines 25–28 still pose "what do we do
  with session state from ttyl?" as open. **Decided: yes — `/ttyl` commits
  `.meta/` state.** The unresolved *sub*-question is real and now urgent:
  committing to `main` is fine solo but breaks multi-developer repos. So
  the ttyl-commit work is gated on the Theme B state model (where does
  branch-volatile state live so it doesn't conflict?).
- **"the philset repo" is ambiguous** → items meant for *this* project land
  in `~/Development/.meta/` or `~/Development/meta/.meta/`. Root cause: a
  sibling `meta/` directory next to the tree-root `.meta/`. Naming
  collision; needs a disambiguation convention + the `philset mv` utility
  to fix existing misroutes. (Theme E)
- **`/riff` and `/defer` are shipped** (accepted 2026-05-23). Treat
  `riff-defer-postvivem.md`, `lightning-round-proposal.md`, and
  `to-do-annex.md` as **consumed**, not pending. The one piece of unbuilt
  value left in the riff postvivems is the *note-then-code-as-default*
  cadence and *push-based scope* lessons — fold those into the `/riff`
  skill, then archive.
- **Developer docs for /riff + /defer** (`roadmap.md`) were blocked on
  "after merge of riff-defer branch." That branch merged (`d92a5a0`).
  **Unblocked.**
- **`multi-stage-ship.md`** likely resolves to "no new skill — `/ship`
  accepts, you implement what you can, `in-progress.md` carries the rest."
  Confirm and close rather than build.

---

## Multi-User Readiness

Job hunt going well → sharing the workflow with teammates soon. This
reframes priority. Honest read: **philset is single-user in three load-
bearing places**, none catastrophic, all need addressing before a teammate
touches a shared repo.

1. **State partitioning (the hard one).** Branch-volatile state in tracked
   `.meta/` files = merge conflicts the first time two people commit. This
   is Theme B / `switch-requirements.md`. Prerequisite for `/ttyl`
   committing, for `/suspend`+`/resume`, and for any shared repo. **Highest-
   risk multi-user item.**
2. **Voice/context is "Phil-shaped."** `WORKFLOW.md` is literally "Working
   with Phil" (his worldview, acronyms, preferences). Study docs say "Phil
   studies…". Multi-user needs a split: **per-developer context** (my
   prefs, my worldview) vs. **shared team context** (conventions everyone
   inherits). The tree walk already supports layering — this is mostly a
   *content* reorganization plus a genericization pass on skill voice.
3. **Onboarding story.** No "here's how a teammate gets started" path.
   `human-implements.md` (agent-agnostic workflow) is the seed of the
   pitch; the README voice guidance (`readme-context.md`: write for humans
   not agents) is the seed of the doc.

Already multi-user-friendly: the inbox-as-staging primitive (concurrency-
safe), the signpost tree (layered context), and the design-as-spec /
review-as-gate model (works regardless of who implements).

---

## Recommended Next Steps (ordered, chunkable)

Sequenced so each chunk reduces the chaos and unblocks the next. Multi-user
(job-hunt timeline) is the spine; loop-closing is the prerequisite that
also fixes the *present* pain.

**0. Hygiene pass (cheap, do first — collapses the chaos).**
Triage `to-do.md` in place (resolve the contradictions above); archive the
consumed items (`riff-defer-postvivem`, `lightning-round-proposal`,
`to-do-annex`); confirm-and-close `multi-stage-ship`. Pure bookkeeping,
no design. Immediately shrinks the inbox by ~4 items.

**1. Close the lifecycle loop (Theme A — fixes the meta-problem).**
The chaos exists because nothing closes loops. Build the loop-closers:
`/ttyl` auto-cleans consumed inbox items; roadmap/to-do completion
graduation (skill-todo-roadmap-integration); **standardize archival**
(answer standardize-archival.png + "where do completed items live?"); and
`/amend` (improvised twice, directly answers the standing `to-do.md`
question about accepted-design lifecycle, low-risk, ready). This chunk pays
for itself by stopping future accumulation.

**2. Multi-user state model (Theme B — the structural prerequisite).**
The big `/draft` session: thread-state vs. project-state partition,
branch-based `.meta/` flow, merge story, and where `/ttyl`'s commit lands.
`switch-requirements.md` is the design input. Unblocks ttyl-commit and
`/suspend`+`/resume`. **Time-sensitive given the teammate timeline.**

**3. Multi-user onboarding + voice split (Theme C).**
Split `WORKFLOW.md` into per-developer vs. shared-team context; genericize
skill voice; write the human-facing README (consume `readme-context.md`,
`human-implements.md`). Depends on Theme B's model being settled.

**4. Altitude-family skills (Theme D — feature work, lower urgency).**
`/study` (proven once, strong), and frame the README around the
altitude-gradient mental model. `/bounce` and `/suspend`+`/resume` fall
out of Theme B.

**5. Naming hygiene (Theme E — cheap, parallelizable).**
`philset mv` utility; resolve the `.meta/` vs `meta/` collision and the
"philset repo" ambiguity so misrouting stops.

---

## External Input
All 17 inbox items above. Key voice constraints captured: README is for
humans not agents (`readme-context.md`); workflow is agent-agnostic
(`human-implements.md`). SII pending: `standardize-archival.png` (feeds
Theme A). Prior baselines: `assessments/philset-v021.md`,
`assessments/no-build-without-ship.md`, and the two archived 2026-05-23
assessments (deferral-patterns, riff-skill) — all consistent with this read.
