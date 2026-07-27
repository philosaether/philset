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
