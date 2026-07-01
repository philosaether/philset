# Roadmap

Future work, **ordered by priority**. Items land here via `/defer`, or get
promoted from `inbox/todo.md` via `/triage`. Each item says what it is and
what's blocking it (if anything).

Reprioritized 2026-07-01 around a career inflection: a job is imminent (solo-dev
era ending in days–weeks), which promotes philset's shared-codebase survival
story to the top. See `decisions.md` (2026-07-01) and the
`philset-development-state` assessment.

---

## Tier 1 — Career-critical (job imminent)

- **`private-meta` signpost flag — standalone shared-codebase unblock** — Fast
  bandaid so philset survives a shared repo with partial/no buy-in from other
  devs: a signpost flag (working name `private-meta: true`) that `.gitignore`s
  `.meta/` and makes the skills degrade gracefully when `.meta/` is
  untracked/absent. Ships **standalone, ahead of the full state model** — it's
  the thing that lets you run philset solo inside someone else's codebase on day
  one. Full correctness is chunk 2 (below); this is the stopgap.
  Deferred from: philset/main (2026-07-01, career inflection braindump).

- **Chunk 2 — multi-user state model (the real fix)** — The #1 project.
  Thread-vs-project state partition, branch-based `.meta`, and where `/ttyl`'s
  commit lands so multi-dev repos don't conflict. Absorbs:
  - **`/suspend` + `/restore` + `/pivot`** — workstream switching with state
    snapshots. `/suspend` parks (commits branch, returns to main); `/restore`
    resumes; `/pivot` is context-aware sugar ("/suspend X and /restore-or-draft-or-riff Y").
    Falls out of the state model. (was: chipper/feature/readonly-chip-mode 2026-05-28)
  - **`/ttyl` commit step** — `/ttyl` commits `.meta/` state (decided 2026-06-25);
    *where* it commits is exactly the chunk-2 question. Auto-clean already shipped
    in chunk 1.
  Full plan in the `philset-development-state` assessment.

- **philset release for work-laptop install** — Cut a release so philset can be
  installed on the work laptop. Per priority call, the significant release lands
  **after chunk 2** (bundling `private-meta` + chunk 2 + `/study`). Open scoping
  note: if the job starts before chunk 2 is done, an **interim release** carrying
  just the `private-meta` flag may be needed to get onto the work laptop sooner.
  Absorbs the **deploy-vs-symlink** reconciliation below as install mechanics.
  Deferred from: philset/main (2026-07-01).

- **philset deploy vs. symlink setup** — `philset init`/`update` *copy* skills
  into `~/.claude/skills/` and references into `~/Development/.meta/references/`,
  but the dev environment *symlinks* skills into the repo, so `update` creates
  divergent copies for new skills and references drift stale. Reconcile (e.g. a
  `philset link` command; make `update` refresh references reliably). New skills
  currently need a manual `ln -s`. **Gates a clean work-laptop install.**
  Deferred from: philset/feature/close-the-loop (2026-06-25).

## Tier 2 — Freelance wind-down + strategic bridge

- **`/refresh` — lightweight `/study` sibling (working name)** — Fast
  re-orientation / shallow-overview skill: what `/riff` is to `/draft`,
  `/refresh` is to `/study`. Reuses the note→comment→quiz loop (proven highly
  effective) but for *quick recall*, not a full deep dive. Two shapes:
  (1) get back up to speed on a repo you've been away from; (2) quick topic
  overview. **Soft-gates the freelance/pro-bono wind-down** (aether/WWTS, then
  ENYC, then the not-yet-started Decatur Block Association site). Motivating case:
  the **aether** repo — dropped last week for interview prep, hard to pick back
  up. Non-code use cases to weigh at draft time: meeting prep, CRM-people refresh
  before a mixer, brushing up college topics before a conversation. Altitude-skills
  family (chunk 4, with `/study` and `/bounce`). Design Qs: relation to an existing
  `/study` doc, how shallow the loop goes, durable artifact vs. ephemeral like a
  riff track. Note adjacency to `/restore` — that reloads *parked session state*;
  `/refresh` rebuilds *understanding* whether or not you formally suspended.
  Deferred from: philset/main (2026-07-01).

- **Praxis integration / CRM + calendar bridge — `/assess` first** — The "bounce
  around `Development/`, think out loud, route conclusions to project dirs"
  workflow is buckling under meeting/third-party-org load. Points at a CRM +
  calendar integration, and at **Praxis as a bridge** between the philset repo on
  the work laptop and the one on the personal machine (shared task-management
  integration). Implies **hardening + portability of the tree-based context
  structure**, which reaches all the way to a philosophy question about the nature
  of philset, praxis, and their relationship. **Next action: `/assess
  philset-praxis-relationship`** — what each system owns today, the integration
  surface (CRM, calendar, tasks), and cross-machine bridge options — *before* any
  `/draft`. Converges the older "PM integration via signpost flags — v0.3+" item.
  Deferred from: philset/main (2026-07-01).

## Tier 3 — Structural chunks (post-inflection)

- **Chunk 3 — onboarding / voice split** — Includes: where git **branch
  conventions** live (domain/user/project context, local overrides global;
  philset ships opinionated defaults — leaning yes), and the **per-developer vs.
  shared-team context split** (which also informs branch conventions and the
  shared-codebase story above).
- **Chunk 4 — altitude skills** — `/study` (shipped), `/refresh` (Tier 2),
  `/bounce` (below).
- **Chunk 5 — naming hygiene** — `philset mv` and related renames.
- **`/bounce` skill (single-session project switch)** — Runs ttyl-writes for the
  outgoing project + hello-reads for the incoming one in one move, without
  resetting conversation context. Use case: a design session spawns a new project
  (WWTS → Aether) and you keep working. `/suspend`+`/restore` covers the
  multi-session case; `/bounce` covers single-session.
  Deferred from: WWTS/meta/wp-nonprofit-scope (2026-06-17).

## Tier 4 — Skill polish & smaller items (promoted from staging)

- **Signpost per-skill config** — (merges "formalize signpost notes" +
  "`extra-steps` field") Let signpost.yml carry per-skill config/extra-steps that
  analysis skills read during tree walk. Concrete case: chipper wants `/review` to
  verify README ↔ API-surface alignment. Proposed shape: `review.dimensions:
  [string]` (and a general per-skill namespace); skills append them as extra
  steps/dimensions. Needs a field-namespace convention + interaction with skill
  overrides. Surfaced 2026-05-22 (chipper) & 2026-06-03 (eventsnyourcity).
- **`/draft` auto-create branch on main (signpost flag)** — Option to make
  `/draft` create a new branch when invoked on main. "Would enable at root."
  Relates to branch-conventions (chunk 3).
  Deferred from: philbas.com/main (2026-05-28).
- **study-skill A2** — (merges two dogfood findings from study/defend-the-takehome,
  2026-06-28) (1) **Multi-round stages**: the per-stage loop needs explicit
  Round 1/Round 2/… support — a stage clears only when the *latest* re-quiz on the
  gaps scores clean, not after the first quiz. Update loop wording + Quiz Log
  format. Distinct from "one stage at a time" (that's no-writing-ahead; this is
  iterating within a stage). (2) **Quiz concepts, sheet the facts**: quizzes
  target concepts/reasoning to reconstruct under pressure, NOT discrete
  facts/numbers/configs — those are a lookup and belong on the Study Product
  sheet. Refines Step 4 quiz-design + the Study Products role. Likely a `/study`
  amendment.
- **`/ship`: gate on unplanned-logic complexity** — Pre-build check: before
  implementing, scan for complex logic the accepted design did NOT scope (e.g. a
  distributed orchestration / test harness). If there's a lot of unplanned
  implicit logic, **block and surface it** for a design/review pass rather than
  vibes-building inline. Why: run-cloud-2's unscoped orchestration harness carried
  5 of 7 deployment bugs while designed+reviewed drivers shipped ~bug-free.
  Deferred from: pl-takehome/feature/ambitious-head-to-head (2026-06-27).
- **Sources / `--cite` in `/assess`** — Add a `## Sources` + inline-citation
  convention for research-backed assessments (cite load-bearing claims, URL
  footer). Flag (`--cite`) or standard when the skill does web research. Proved
  its worth making claims auditable.
  Deferred from: pl-takehome-technical/meta/queue-backend-scoping (2026-06-25).
- **Roadmap-inbox association** — Link `.meta/inbox/` items to specific roadmap
  items so they stay connected but don't clutter `/hello` scans (e.g. a
  `repeating-clauses.md` file belongs to an existing roadmap item; no way to mark
  that + suppress it from the inbox listing). (The "where do completed items live"
  half is resolved — `archive/rearview.md`, standardized in chunk 1.)
  Deferred from: chipper/main (2026-05-27).
- **`/riff` default cadence + push-based scope** — (1) Make note-then-code the
  *default* cadence `/riff` instructs; (2) support a push-based "standing by"
  scope for parallel-session-driven riffs (Claude idles between pushed items).
  Also fold in **date-based riff branch names** (`riff/2026-05-28` when there's no
  topic slug). Deferred from: philset/main (2026-06-25) & philbas.com/main (2026-05-28).
- **Per-feature token cost tracking (signpost convention)** — Formalize the proven
  ccusage-snapshot workflow: `track-token-costs: true` causes `/assess` or
  `/draft` to snapshot and `/review`/merge to snapshot + diff, logged to
  `.meta/token-costs.md`. Independent feature, not in the chunks.
  Deferred from: philbas.com/feature/activity-connector (2026-06-01).
- **Developer documentation for `/riff` and `/defer`** — README sections for the
  new skills, including verification loops (where to document project-specific
  conventions like SII).
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
- **Extract hardcoded meta-README from `/hello`** — `/hello` Step 3 inlines the
  `.meta/` directory description, duplicating `templates/meta-README.md`. Should
  reference the template instead.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
- **Formalize "external writes go through inbox" principle** — The invariant that
  cross-project writes land in inbox, not directly in curated state files.
  Currently in the defer-skill design doc; should be a stated philset principle in
  the README + referenced in skill docs.
  Deferred from: philset/main (2026-05-23).

## Backlog (unscoped / v0.3+)

- **ultradraft mode** (cloud-based design iteration) — v0.3+
- **Context compaction resilience testing**
