# To-Do / Open Questions

Inbound items and open process questions. From cross-project `/defer` or manual
capture; sorted into `roadmap.md` via `/triage`.

Fully triaged 2026-07-22 (email inbox + 17 staged items): 3 done-now, 7 promoted,
4 merged into existing roadmap items, 1 discarded as duplicate, 1 graduated.
One item left staging (below).

---

- **Topic-checklist deliverable type — formalize "the agenda, not the script"** — A named,
  reusable deliverable type for pre-drafted comms the human delivers *live*: a sparse,
  nested-bullet **topic checklist** (topics → subtopics → ✍️ must-nail / get-in-writing
  points), NOT a drafted message. Matches Phil's own prep habit (sparse Google-doc bullet
  trees before a meeting or important email). Corollary of *human-implements*: when the
  human is the delivery channel, the artifact is the agenda, not the script (now a root
  WORKFLOW.md note under Collaborative Writing, 2026-07-12). **Canonical specimen:** §3 of
  `plastic-labs/.meta/designs/monday-bundle-vineeth.md` — the shape to generalize from.
  **Open fork — where it lives:** the pattern library (if we *don't* adopt OpenSpec) vs. a
  philset primitive (a `/draft` output-mode toggle, or its own skill). Decide later.
  *(Left in staging 2026-07-22: the where-it-lives fork waits on the OpenSpec call —
  see the heading-adjustment OpenSpec exploration item on the roadmap.)*
  Deferred from: plastic-labs/monday-bundle ship + career audit session (2026-07-12).

- **Generalize `/triage`: all-channel novelty ingestion, not todo.md-sorting** — Today
  `/triage` models exactly one intake channel (`todo.md` → `roadmap.md`) and *stops* if
  that file is missing. Novelty actually enters a project through at least four:
  (1) **`inbox/` artifacts** — screenshots, exports, client comms; unstructured, need
  extraction before they can be dispositioned; (2) **`todo.md`** — pre-structured work
  items (the only supported one); (3) **conversational** — the user says a thing in
  session; it exists only in context and is lost at `/ttyl` unless filed; (4)
  **drift/residue** — uncommitted state, stale claims, docs that disagree with
  implementation. Channel 4 is the strongest add: root WORKFLOW.md already mandates
  *"where implementation disagrees with designs or decisions, there is a bug — surface
  it,"* and no skill owns that sweep.
  **Output contract (the real reframe):** triage's deliverable isn't "items sorted into
  buckets," it's *the project restored to unidirectional flow along a clear GoV* — one
  obvious next action, no back-eddies where a stale doc routes you wrong. Under that
  contract the four dispositions (promote / do-now / resolve / leave) are just the
  todo.md-shaped instance of a general operation: **place each piece of novelty at its
  correct permanence and scope** — i.e. apply *run at the span, file at the subject*
  (already canonical in WORKFLOW) to intake.
  **Boundary:** `/defer` is the outflow gate (work → staging); `/triage` is the intake
  gate. `/hello` currently *reads* `inbox/` but nothing formally *consumes and archives*
  it — the practice exists (commits literally read "archive consumed inbox") but is
  homeless. It belongs to triage.
  **Tell that motivated this:** a WWTS session with three live novelty inputs (a client-
  text screenshot carrying design sign-off, two conversational updates, and an
  unreconciled prior session) hit the `todo.md`-missing stop-condition and bailed. A
  missing `todo.md` is the least informative possible reason to stop triaging.
  Deferred from: WWTS/main (2026-07-26).

- **update/init symlinked-destination guard (live incident)** — `philset
  update` on a dev-linked box copies the installed package's (stale)
  skills/references *through* dev-link's dir-level symlinks into the repo
  working tree. Predicted by the 2026-06-25 "deploy/symlink inconsistency"
  deferral; fired 2026-08-15 09:15:33 (37s after the v0.4.0 tag): the
  global 0.2.1 silently reverted 7 skills + 3 references in the repo.
  Caught 2026-08-16 at publish preflight (tag-worktree publish shipped
  exact tag bits; worktree restored; global bumped to 0.4.0). Fix shape:
  extend `sync`'s symlinked-destination dev-link guard to the update/init
  deploy paths (skip or refuse, say why); consider warning when
  installed-package version < repo version on a dev box. NB the hazard
  re-arms as soon as repo skills move past the installed version —
  currently defused only because both sit at 0.4.0.
  Deferred from: Development root hub session (2026-08-16).

- **Formalize `/plant` (+ the `seeds/` primitive) — the upstream half of `/sprout`**
  *(deferred from Development/ hub, 2026-08-19)* — Improvised live at
  `~/.claude/skills/plant/` (plain dir beside the symlink farm; unsynced, one-disk —
  spec recoverable from the skill file, root decisions 2026-08-19, and the specimen
  seed). `/plant` persists an idea-seed to `.meta/seeds/` (frontmatter lifecycle
  `dormant → sprouted → composted`; `index.md`; file-at-the-subject; bar: "no salient
  thread unfollowable"; agent-invoked on plant intent) so `/sprout` (roadmap Tier 3,
  consolidated 2026-07-22) can later open a workspace from it. Reconcile the pair at
  formalization: sprout's "seed roadmap.md from deferrals" step gains "read Sprout
  Paths from the seed," and plant defines the seed interface sprout consumes. Adoption
  wants: `philset sync`/`update` awareness of non-farm skill dirs, `/hello` surfacing
  a dormant-seed count (index exists for exactly this), template into `templates/`.
  Specimen: `~/Development/.meta/seeds/persona-harness.md`.

- **/sprout dogfood datum #2 (2026-08-22, hub session):** Phil: "/sprout a
  workspace to handle household management." No seed file existed — the input
  was a live directive + an exemplar pointer (the Magician), not
  `.meta/seeds/`. Performed by hand (`~/Development/household/` + nested
  `furniture/` exemplar project). Contract implication: /sprout's input is
  *seed-file OR live charter* — the seed file is one entry point, not the
  definition. Pairs with the 2026-08-19 /plant improvisation.

- **A philset browser layer on the muster-roll UI** — superseded by
  `handoff-2026-09-06-viewport.md` in this inbox (the full brief: a
  lightweight, npm-shippable philset viewport executable).
  Deferred from: gaming/feature/eidolon (2026-09-05).
