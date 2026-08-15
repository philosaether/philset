---
name: review
description: Pre-merge review. Diffs the session's work against the base branch, resolves its review dimensions (configurable via signpost `review.dimensions`/`extra-dimensions`, else inferred from the medium — code default: bugs/efficiency/redundancy/architecture/comment-reconciliation/runtime-multiplicity/peer-consistency — with `redundancy` the recommended-but-configurable example), always runs the structural dimensions (design/track/merge reconciliation), reports a required `Cleared` section, then presents fixes for approval before committing.
---

# Review

Pre-merge code review. Run this before merging a feature branch or at end-of-session to catch issues while context is fresh.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Flush decisions.md

Before reviewing, ensure any decisions made during conversation are
captured in `decisions.md`. Scan the conversation for decision-like
statements that haven't been logged yet. Append them now — `/review`'s
merge-readiness check depends on `decisions.md` being current.

## Step 2: Scope the work

Determine what to review based on context:

1. **On a feature branch, not yet merged (normal case):** Diff against
   the base branch (usually `main`). Include unstaged and uncommitted
   changes — review everything.

2. **On a feature branch, already merged (forgot to review):** The diff
   against main is empty. Find *this branch's* merge commit and review
   everything that came in with it.

3. **On main, no args:** Review the most recent merge commit — diff
   everything that came in with that merge.

4. **Explicit branch/ref argument** (e.g., `/review feature/junior-work`):
   - If the branch is not yet merged: diff it against main (same as case 1,
     but for a named branch).
   - If the branch is already merged: find its merge commit and diff
     everything that came in with that merge.

Summarize what was touched: files changed, features added, areas modified.
This is your review surface.

## Step 3: Resolve the review surface, then analyze

`/review` has two classes of dimension. **Structural** dimensions are
philset-native — they check the design/track/state artifacts, not the medium,
and **always run**. **Medium** dimensions depend on *what* you're reviewing
(code vs. prose vs. …) and are **resolved** per project. Only the medium set is
configurable.

### 3a: Resolve the medium dimensions

Resolve in precedence order — first hit wins:

1. **Explicit config.** Walk the signpost tree (as `/hello` does):
   - `review.dimensions: [...]` in `signpost.yml` — **replaces** the medium set
     (inherited down the tree; child overrides on collision).
   - `review.extra-dimensions: [...]` — **appends** to the resolved set (e.g. a
     category dir sets one project-family check that all children inherit).
   - **Both may coexist and combine:** `dimensions` sets the base (replacing the
     inferred set), then `extra-dimensions` appends to that base. If only
     `extra-dimensions` is set, it appends to the *inferred* set.
   - Else, dimension preferences stated in prose in `WORKFLOW.md` — a soft,
     lowest-precedence default (e.g. "I mostly review prose"). Structured
     (signpost) beats prose (WORKFLOW) beats inferred.
2. **Infer** (if unconfigured). Judge the medium:
   - code (has source / `architecture` not false) → **code default set:**
     `bugs, efficiency, redundancy, architecture, comment-reconciliation,
     runtime-multiplicity, peer-consistency`.
   - non-code (`architecture: false`, prose-heavy) → a prose set
     (`clarity, structure, voice, factual-accuracy, redundancy`). *The real
     non-code set is still being calibrated — infer, then lean on 3b + `/retro`.*
   - factor in what the branch actually changed (docs-only? tests-only?).
3. **Ask** — only if genuinely ambiguous (e.g. a mixed docs+code branch):
   "Review for [X, Y], or add [Z]?"

`redundancy` is the **canonical configurable-but-recommended dimension**: on by
default in every set, but a project can drop it via `review.dimensions`. When
unsure whether a dimension applies, reason from `redundancy` — everyone *should*
want it; not everyone will.

**Structural dimensions always run and are never configured:** design
reconciliation, track reconciliation, merge readiness (see 3c).

### 3b: Persist + calibrate (only when resolved by inference/ask)

If the medium set came from **config**, skip this — configured runs are silent.
If it came from **inference or ask**:

- **Only count project-representative inferences.** If you *adapted* the medium set
  because the branch content is **atypical** for the project (a docs-only or
  tests-only branch on a code project, etc.), **announce it but do NOT record or
  count it** toward N=3 — that run is a one-off, not evidence about the project's
  stable medium. Recording it would risk auto-persisting the wrong set (e.g. a prose
  set onto a code project after a run of docs-only branches). Only inferences that
  reflect the project's *normal* medium accumulate below. (See design amendment A1.)
- **Record a breadcrumb.** Keep a *single* `## Review Dimensions` note in
  `breadcrumbs.log` holding one line — the current inferred set and a run-count:
  `- inferred [bugs, efficiency, redundancy, architecture] ×2`. Update it by
  comparing this run's inferred set to the line's set:
  - **same set** → increment the count (`×2` → `×3`).
  - **different set** → replace the line entirely with the new set at `×1`.
  The note survives the session boundary, so the count accumulates across
  sessions and a later `/retro` can calibrate it.
- **Auto-persist at N=3.** If incrementing brings the count to **×3** (the 3rd
  consecutive run with the same inferred set, no correction in between), then
  *after* recording it: write the set to the project `signpost.yml` as
  `review.dimensions`, announce *"locked in after 3 consistent runs,"* and
  **delete the note**. Users who never configure still get consistency.
- **On correction** (user changes the set now, or later via `/retro`): write the
  corrected set to `signpost.yml` immediately and **delete the note** — a
  corrected set skips straight to configured (it does not restart at `×1`).

### 3c: Run the analysis

Launch explore agents in parallel — one per **resolved medium dimension** plus
the **structural dimensions** — each focused on the changed files.

**Medium (resolved in 3a) — code default descriptions:**
- **Bugs**: edge cases, off-by-one, null/undefined risks, missing error handling at boundaries, race conditions, logic errors. Correctness, not style.
- **Efficiency**: unnecessary allocations, redundant loops, O(n^2) patterns, code that works but could be tighter.
- **Redundancy**: duplicated logic, copy-pasted patterns, new code duplicating something already in the codebase. Check within the diff and against existing code.
- **Architecture consistency** (only if `.meta/logical-architecture.md` exists): does new code match the documented structure? New files where the architecture says; doc reflects new modules. Reconcile doc ↔ code where they diverge — update whichever is more correct.
- **Comment reconciliation** (the audience pass): every durable string in the
  diff — comment, docstring, log/error message — must serve an enumerated
  persona or move. Personae: **P1** the next maintainer (an agent; primary —
  wins conflicts), **P2** the operator, **P3** a repo teammate with no `.meta/`
  access, **P4** runtime readers (log consumers). Predicate: *who acts on this
  string, and when?* Dispositions: **keep / rewrite / split / relocate /
  delete**. Preservation is restricted to channels with working read-halves —
  the code itself, the blame→PR walk, commit messages; **never introduce new
  channels** (`.meta/` gets nothing new). Named rule: **keep the incident,
  strip the session** — durable regression receipts stay; phase labels, run
  numbers, authoring dates, personal attribution go. On large diffs run this
  as its own subagent — writer and editor must be different instruments.
  Honor inheritable domain rules from signpost
  `review.comment-reconciliation.rules: [...]` (walked and merged like the
  other review config). Report per-run disposition counts in the findings.
- **Runtime multiplicity**: for state written to a process global
  (module-level mutable, in-process cache or counter), answer *"how many
  processes run this line?"* from **deployment config** — process groups,
  replica counts, worker settings — not from the code, because the evidence
  lives in files a code-focused pass never opens.
- **Peer consistency**: when the diff adds a member to an existing family (a
  handler among handlers, a config key among keys, a script among scripts),
  enumerate the siblings and find the invariant that breaks — in **both
  polarities**: the new member may break the family's standing invariant, or
  the new member may introduce an invariant the existing siblings don't
  follow.
- *(Non-code dimensions, when resolved, are judged by their name — clarity, structure, voice, factual accuracy — against the changed prose.)*

**Structural (always run):**
- **Design reconciliation** (only if an accepted design doc in `designs/` matches the branch/recent work): categorize each section implemented / diverged / deferred / added; suggest reconciliation steps.
- **Track reconciliation** (only if a `tracks/` file matches the current branch): categorize each note played / deferred / unplayed; flag unplayed notes (forgotten work or silently-dropped scope).
- **Merge readiness**: will `.meta/` state files (decisions.md, in-progress.md) conflict with the base branch? Do commits landed on main since the branch diverged introduce contradictions (overlapping decisions, conflicting in-progress, colliding architecture)? Flag cross-branch decision conflicts for human resolution.

## Step 4: Present findings

**Transparency rule:** if the medium dimensions were resolved by **inference or
ask** (not config), state at the top of the findings which medium dimensions you
reviewed against and why, and offer to persist or adjust them — this is the
calibration surface (it feeds 3b and `/retro`). Configured runs stay silent about
dimension selection.

Compile the results into a single summary, organized by severity:

- **Bugs** (must fix): Correctness issues that will cause problems
- **Improvements** (should fix): Efficiency or redundancy issues worth addressing
- **Nits** (optional): Minor things that could be cleaner but aren't urgent

For each finding, show:
- The file and line(s)
- What the issue is
- What the fix would be

Every report ends with a required **`Cleared`** section: per dimension, what
was examined and affirmatively cleared ("checked X against Y — holds").
Deliberately not a dimension — it detects nothing and costs a paragraph, but
it buys three things: it disambiguates silence (an unmentioned concern
otherwise reads identically to an unexamined one), it carries the argument for
the real findings (a finding stated against cleared near-neighbours reads as a
conclusion, not an opinion), and it is the measurement substrate for the
dimensions themselves (a dimension that only ever emits `Cleared` lines is a
prune candidate).

If nothing is found, say so — don't invent issues; the `Cleared` section still
runs.

## Step 5: Get approval

Present all proposed fixes for review. Wait for approval before making any changes. The user may approve all, some, or none.

## Step 6: Fix and commit

After approval, apply the approved fixes. Commit them **separately from the session's feature work** with a message like:

```
review: fix [brief description of what was fixed]
```

This keeps review fixes distinct from feature commits in git history.

## Step 7: Reconcile the design doc

If a design doc was reconciled in Step 2 (dimension 5), update it in place:

- Add implementation notes to the frontmatter:
  ```markdown
  ---
  Implemented: <today> (<branch>)
  Divergences: <brief summary, or "none">
  Deferred: <items not built, or "none">
  ---
  ```
- For each deferred item, judge disposition: `/defer` to roadmap if it's
  genuine future work, leave in the design doc if it's design-iteration
  scope, or note as intentionally cut
- Log to `decisions.md` if divergences are architecturally significant

Do NOT archive the design doc — designs stay in `designs/` as the current spec until superseded by a newer design (archival happens in `/ship`).

If no design doc was involved, skip this step.

## Step 8: Graduate completed items

Check whether any items in `roadmap.md` **or** `inbox/todo.md` have been
completed by the work under review. For each completed item, per the archival
convention (`references/archival.md`):

1. Remove it from its source file (`roadmap.md` or `todo.md`)
2. Append it to `archive/rearview.md` (create the file if needed, with
   header: `# Rearview — Completed Items`)
3. Add a `Completed: [date] ([branch])` line to the archived entry

Match semantically; confirm before removing a hand-curated item. If nothing
was completed, skip this step.

## Step 9: Archive assessments

If any assessment docs in `assessments/` were consumed during this session's work (i.e., the work addressed gaps or next steps from the assessment), move them to `archive/assessments/` with a date prefix, per the archival convention (`references/archival.md`). Assessments are snapshots — once acted on, they belong in the archive.
