# Roadmap

Future work, **ordered by priority**. Items land here via `/defer`, or get
promoted from `inbox/todo.md` via `/triage`. Each item says what it is and
what's blocking it (if anything).

Reprioritized 2026-07-03 around **two approaching inflections**, both of which
call for a release:

1. **Job imminent** (solo-dev era ending in days–weeks) — philset must survive a
   shared/multi-user repo with limited or no dev buy-in. *Internal-facing.*
2. **Reddit interest** — solo creatives, some non-code, starting to use the
   skills. Wants low-hanging non-code friendliness *without losing precision*;
   deeper generalization waits for real user feedback. *External-facing.*

Neither inflection's **floor** needs chunk 2, so the next release (**v0.3
"portable + welcoming"**) cuts *before* the multi-user state model, bundling both
floors — the geodesic move (job + brand + user-growth on one release) and the
used-then-iterated move (the release is the reality-probe that tells us what
non-code users actually need). chunk 2 becomes **v0.4**, informed by real
multi-dev contact once the job starts.

See `decisions.md` (2026-07-01, 2026-07-03) and the `philset-development-state`
assessment.

---

## Tier 1 — v0.3 "portable + welcoming" (the next release)

Serves both inflection floors. Cut the release when these four land.

- **`private-meta` signpost flag — shared-codebase unblock** *(job floor)* — A
  signpost flag (working name `private-meta: true`) that `.gitignore`s `.meta/`
  and makes skills degrade gracefully when `.meta/` is untracked/absent. The
  thing that lets philset run solo inside someone else's codebase on day one.
  Full multi-user correctness is chunk 2 (v0.4); this is the stopgap that ships
  now. Deferred from: philset/main (2026-07-01, career inflection braindump).

- **philset deploy vs. symlink reconciliation** *(clean install)* — `philset
  init`/`update` *copy* skills into `~/.claude/skills/` and references into
  `~/Development/.meta/references/`, but the dev environment *symlinks* skills
  into the repo, so `update` creates divergent copies for new skills and
  references drift stale. Reconcile (e.g. a `philset link` command; make `update`
  refresh references reliably). New skills currently need a manual `ln -s`.
  **Gates a clean work-laptop / stranger install.**
  Deferred from: philset/feature/close-the-loop (2026-06-25).

- **Non-code low-hanging-fruit pass** *(reddit floor — NEW 2026-07-03)* —
  Precision-preserving cheap wins that make philset friendlier for non-code users
  (writers, other solo creatives). **Audit-only, not a generalization project** —
  deeper generalization is Tier 3, gated on real feedback. Scope:
  - **Language audit** — find skills that say "code/codebase" where they mean
    "artifact/work" and generalize the framing. `/draft` already handles non-code
    artifacts (READMEs, case studies) and `/study` already handles primary
    sources — make that explicit rather than code-implied elsewhere.
  - **Document `architecture: false`** as the sanctioned non-code escape hatch
    (it already exists — turns off the codebase-map expectation; just
    undocumented for this use).
  - **Note the sharp edge:** `/review`'s dimensions (bugs, efficiency) are the
    most code-locked surface; a writer wants prose review. Configurable dimensions
    is the *signpost per-skill config* item (Tier 4) → the deep generalization
    (Tier 3). Flag it as the first thing user feedback will pull in; don't build
    it speculatively.
  - **Git-setup tutorial for non-devs** — *pulled out to its own `/draft`
    post-v0.3-ship* (deserves more than a riff bullet; see Tier 2). git *stays*;
    a guided setup flow, not skill surgery. The heavier `git-integration: false`
    no-git flag remains Tier 3, gated on feedback.
  Delivered in v0.3 riff (2026-07-03): language audit + `architecture: false`
  doc landed; `/review` prose-dimensions and the git tutorial pulled to their own
  roadmap items (below / Tier 3).
  Deferred from: philset/main (2026-07-03, triage).

- **README-for-humans + onboarding pass** *(brand/onboarding — both audiences)* —
  The README must read for *humans deciding whether to adopt philset*, not for
  agents. Key framing (from `inbox/readme-context.md`): assess → draft → ship is
  a slower, collaborative `/plan` that produces a durable artifact and supersedes
  built-in plan mode. Absorbs:
  - `inbox/human-implements.md` — the `/ship`→`/review` loop works even when the
    *human* is the implementer (design doc = spec; `/review` compares the artifact
    regardless of who built it). Directly supports the non-code story.
  - `inbox/anecdotes.md` — concrete "principles in action" evidence for the
    README / case-study material.
  - **Developer documentation for `/riff` and `/defer`** — README sections for the
    newer skills, including verification loops (where to document project
    conventions like SII). *(was Tier 4)*
  - **Formalize "external writes go through inbox" as a stated principle** — the
    invariant that cross-project writes land in inbox, not directly in curated
    state files. Currently only in the defer-skill design doc. *(was Tier 4)*
  Backing inbox files: `readme-context.md`, `human-implements.md`, `anecdotes.md`.
  Deferred from: philset/main (2026-04-30, 2026-05-23; consolidated 2026-07-03).

> ═══════════ RELEASE v0.3 "portable + welcoming" cuts here ═══════════
> Both inflection floors covered: portable (private-meta + clean install) for the
> job, welcoming (non-code polish + human README) for the Reddit creatives.

---

## Tier 2 — v0.4 "the real multi-user fix" + strategic bridge

- **Chunk 2 — multi-user state model (the real fix)** — The #1 structural
  project; the full multi-user story `private-meta` only stopgaps. Thread-vs-project
  state partition, branch-based `.meta`, and where `/ttyl`'s commit lands so
  multi-dev repos don't conflict. Now that the job has started, this iterates
  against *real* multi-dev friction (used-then-iterated). Absorbs:
  - **`/suspend` + `/restore` + `/pivot`** — workstream switching with state
    snapshots. `/suspend` parks (commits branch, returns to main); `/restore`
    resumes; `/pivot` is context-aware sugar. Falls out of the state model.
    (was: chipper/feature/readonly-chip-mode 2026-05-28)
  - **`/ttyl` commit step** — `/ttyl` commits `.meta/` state (decided 2026-06-25);
    *where* it commits is exactly the chunk-2 question. Auto-clean already shipped
    in chunk 1.
  Backing inbox files (design input): `switch-requirements.md` (empirical /switch
  friction — the thread concept, in-progress.md serving two masters),
  `workstream-switching.md` (the /suspend+/resume assessment). Full plan in the
  `philset-development-state` assessment.
  → **v0.4 = private-meta + chunk 2 + `/study`** (the significant work-laptop
  release: full multi-user correctness, not just the stopgap).

- **`/refresh` — lightweight `/study` sibling (working name)** — Fast
  re-orientation / shallow-overview skill: what `/riff` is to `/draft`,
  `/refresh` is to `/study`. Reuses the note→comment→quiz loop for *quick recall*,
  not a full deep dive. Two shapes: (1) get back up to speed on a repo you've been
  away from; (2) quick topic overview. **Soft-gates the freelance/pro-bono
  wind-down** (aether/WWTS, then ENYC, then the not-yet-started Decatur Block
  Association site). Motivating case: the **aether** repo — dropped for interview
  prep, hard to pick back up. Non-code use cases to weigh at draft time: meeting
  prep, CRM-people refresh before a mixer, brushing up college topics. Altitude-
  skills family (chunk 4, with `/study` and `/bounce`). Design Qs: relation to an
  existing `/study` doc, how shallow the loop goes, durable artifact vs. ephemeral.
  Adjacent to `/restore` (reloads *parked session state*) — `/refresh` rebuilds
  *understanding* whether or not you formally suspended. Note: `integrated-workflow-
  system` Stage 1 scopes a minimal `/refresh <contact>` CRM meeting-prep read;
  that slice may ship ahead of the full skill.
  Deferred from: philset/main (2026-07-01).

- **Integrated Workflow System (Praxis + calendar/CRM bridge)** — **Designed**:
  see `designs/integrated-workflow-system.md` (accepted, amended A1+A2) and
  `assessments/philset-praxis-relationship.md`. philset (*how*) + Praxis
  (*importance*) + calendar (*when*) + CRM (*who*) as orthogonal relations over one
  leaf-set; sync at the leaf via a Praxis-minted association key, never the tree.
  Staged path:
  - **Stage 1** — calendar-into-`/hello` + minimal CRM meeting-prep read.
    *Shipped + merged 2026-07-01.*
  - **Stage 2** — `private-meta` (now v0.3) + chunk 2 (now v0.4). *Split across
    the two releases above.*
  - **Stage 3** — cross-machine leaf sync via the prod Praxis DB: `praxis-sync`
    signpost flag (opt-in), association keys minted by Praxis + stamped at
    `/triage`, bidirectional conceptual-match merge, conflicts surfaced in
    `/triage`/`/ttyl`. First concrete value = cross-machine `/defer`.
  - **Stage 4** (horizon) — Praxis-as-orientation-GUI, time-aware nudges,
    why-layer→philset-agent-context, notebook↔inbox convergence.
  Praxis-side work (key endpoint, leaf upsert/pull, Rules agent-context) is
  cross-deferred to the praxis inbox.
  Designed: philset/feature/integrated-workflow-system (2026-07-01).

- **Interaction-log primitive (the who-layer data model)** — *Wants its own
  `/draft`.* A system-wide primitive giving the `who` relation structure (see
  integrated-workflow-system amendment A2). Shape: **typed entities (person /
  org)**, **interactions ↔ entities many-to-many** (one email to David\@Farsight
  cc Drew\@Motion logs under all four); each interaction = **1-sentence summary +
  link back to source**; **two capture surfaces** — an **auto-hook** after
  MCP-backed actions (the who-layer builds itself from the agent's own actions)
  and a **manual path** (CLI / day-log processing — same seam as notebook↔inbox)
  for un-instrumented platforms (WhatsApp, LinkedIn, in-person). **Cross-cutting:**
  touches tasks, priorities, timeline. **Backing:** Google Contacts now →
  Praxis-native later. Surfaced by the NYC-trip outreach dogfood (2026-07-01):
  Gmail-only search found one lead (Farsight) and structurally *could not* find the
  rest — they live on LinkedIn/WhatsApp.
  Deferred from: philset/feature/integrated-workflow-system (2026-07-01).

- **Connector-health check at `/hello`** — Both Calendar and Gmail MCP tokens were
  expired at first use (2026-07-01), only discovered mid-task. `/hello` (when
  `calendar`/MCP features are on) should do a quick "connectors healthy?" check
  and flag stale auth up front. Small.
  Deferred from: philset/feature/integrated-workflow-system (2026-07-01).

- **`/hey` — lightweight `/hello`** — Informal session-start that loads light,
  local context only (no full tree walk, no MCP/API reads), with a `/riff`-style
  **escalation gate** that pulls full context if the session deepens. The pressure
  valve for `/hello` getting heavier as the integrated system adds calendar/CRM/
  Praxis reads to session-start.
  Deferred from: philset/feature/integrated-workflow-system (2026-07-01).

- **Git-setup tutorial for non-devs — wants its own `/draft`** — Pulled out of the
  v0.3 non-code low-hanging pass (deserves more than a riff bullet). A guided,
  precision-preserving onboarding flow for solo creatives who don't know git:
  *git stays* (prose version history is a feature, not a tax) — we teach the ~5
  commands you actually need and let philset drive the rest. Design Qs for the
  draft: reference doc vs. README section vs. an interactive `/hello`-adjacent
  flow; how much git to expose; where it's pointed at from (README onboarding).
  Distinct from the `git-integration: false` no-git flag (Tier 3, feedback-gated)
  — this *keeps* git and lowers the adoption ramp. Do **after** v0.3 ships.
  Deferred from: philset/riff/v0.3-portable-welcoming (2026-07-03).

## Tier 3 — Structural chunks + deep generalization (post-inflection)

- **Non-code deep generalization** *(NEW 2026-07-03 — GATED ON USER FEEDBACK)* —
  The real "philset for non-code creatives" work, deliberately deferred until the
  v0.3 release surfaces what solo creatives actually hit (don't over-anticipate a
  writer's needs). Candidate scope once feedback lands: **configurable `/review`
  dimensions** (prose review vs. bug/efficiency — depends on *signpost per-skill
  config*, Tier 4), a **document-map** generalization of `logical-architecture.md`,
  **prose/writing conventions** as a WORKFLOW-style layer, and a
  **`git-integration: false` signpost flag** (no-git mode — ripples across most
  skills: `/review` diffs branches, `/ship` branches, `/ttyl` commits; only worth
  building if a live non-dev user actually *refuses* git rather than just needing
  the Tier-1 setup tutorial). Do NOT build speculatively — this item exists to
  *catch* feedback, not to preempt it.
  Deferred from: philset/main (2026-07-03, triage).

- **Chunk 3 — onboarding / voice split** — Where git **branch conventions** live
  (domain/user/project context, local overrides global; philset ships opinionated
  defaults), and the **per-developer vs. shared-team context split** (also informs
  branch conventions and the shared-codebase story).

- **Chunk 4 — altitude skills** — `/study` (shipped), `/refresh` (Tier 2),
  `/bounce` (below).

- **Chunk 5 — naming hygiene** — `philset mv` and related renames. Backing inbox
  file: `philset-mv.md` (full spec — context-aware directory move that rewrites
  references across the tree; `--dry-run` default, git-aware, path normalization).

- **`/bounce` skill (single-session project switch)** — Runs ttyl-writes for the
  outgoing project + hello-reads for the incoming one in one move, without
  resetting conversation context. `/suspend`+`/restore` covers the multi-session
  case; `/bounce` covers single-session.
  Deferred from: WWTS/meta/wp-nonprofit-scope (2026-06-17).

## Tier 4 — Skill polish & smaller items

- **Signpost per-skill config** — (merges "formalize signpost notes" +
  "`extra-steps` field") Let signpost.yml carry per-skill config/extra-steps that
  analysis skills read during tree walk. Concrete cases: chipper wants `/review`
  to verify README ↔ API-surface alignment; **the non-code story wants
  `review.dimensions` so a writer gets prose review** (this is the primitive the
  Tier-3 deep generalization depends on). Proposed shape: `review.dimensions:
  [string]` + a general per-skill namespace; skills append them as extra
  steps/dimensions. Needs a field-namespace convention + interaction with skill
  overrides. Surfaced 2026-05-22 (chipper) & 2026-06-03 (eventsnyourcity).

- **Roadmap-inbox association** — Link `.meta/inbox/` items to specific roadmap
  items so they stay connected but don't clutter `/hello` scans. **Doubly
  motivated as of 2026-07-03:** this triage found *six* inbox files that are all
  unfiled design-input/content for existing roadmap items (`switch-requirements`,
  `workstream-switching` → chunk 2; `philset-mv` → chunk 5; `readme-context`,
  `human-implements`, `anecdotes` → README pass). They're wired to their items by
  hand above — the exact gap this item closes. Consider bumping.
  Deferred from: chipper/main (2026-05-27).

- **`/draft` auto-create branch on main (signpost flag)** — Option to make
  `/draft` create a new branch when invoked on main. "Would enable at root."
  Relates to branch-conventions (chunk 3).
  Deferred from: philbas.com/main (2026-05-28).

- **study-skill A2** — (merges two dogfood findings from study/defend-the-takehome,
  2026-06-28) (1) **Multi-round stages**: the per-stage loop needs explicit
  Round 1/Round 2/… support — a stage clears only when the *latest* re-quiz on the
  gaps scores clean. (2) **Quiz concepts, sheet the facts**: quizzes target
  concepts/reasoning to reconstruct under pressure, NOT discrete facts/numbers —
  those belong on the Study Product sheet. Likely a `/study` amendment.

- **`/ship`: gate on unplanned-logic complexity** — Pre-build check: before
  implementing, scan for complex logic the accepted design did NOT scope (e.g. a
  distributed orchestration / test harness). If there's a lot of unplanned implicit
  logic, **block and surface it** for a design/review pass rather than vibes-
  building inline. Why: run-cloud-2's unscoped orchestration harness carried 5 of 7
  deployment bugs while designed+reviewed drivers shipped ~bug-free.
  Deferred from: pl-takehome/feature/ambitious-head-to-head (2026-06-27).

- **Sources / `--cite` in `/assess`** — Add a `## Sources` + inline-citation
  convention for research-backed assessments. Flag (`--cite`) or standard when the
  skill does web research.
  Deferred from: pl-takehome-technical/meta/queue-backend-scoping (2026-06-25).

- **`/riff` default cadence + push-based scope** — (1) Make note-then-code the
  *default* cadence `/riff` instructs; (2) support a push-based "standing by" scope
  for parallel-session-driven riffs. Also fold in **date-based riff branch names**
  (`riff/2026-05-28` when there's no topic slug).
  Deferred from: philset/main (2026-06-25) & philbas.com/main (2026-05-28).

- **Per-feature token cost tracking (signpost convention)** — Formalize the proven
  ccusage-snapshot workflow: `track-token-costs: true` causes `/assess` or `/draft`
  to snapshot and `/review`/merge to snapshot + diff, logged to
  `.meta/token-costs.md`.
  Deferred from: philbas.com/feature/activity-connector (2026-06-01).

- **Extract hardcoded meta-README from `/hello`** — `/hello` Step 3 inlines the
  `.meta/` directory description, duplicating `templates/meta-README.md`. Should
  reference the template instead.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).

- **Commit-convention signpost flag** — A signpost flag letting a repo declare
  its commit/push policy so skills (`/ttyl`, `/triage`, `/ship`, `/review`)
  commit and push consistently instead of each guessing. Common-sense defaults:
  `.meta/` bookkeeping commits to the current branch (often main) directly; code
  changes branch first; never auto-push unless the policy opts in. Motivated by
  this session — committing `.meta/` bookkeeping straight to main matched project
  convention but sits in tension with the generic "branch first on the default
  branch" harness default; the flag makes that policy explicit and machine-read
  rather than convention-by-memory. Relates to **chunk 3** (branch conventions —
  where domain/user/project git policy lives) and **signpost per-skill config**
  (same per-skill namespace mechanism).
  Deferred from: philset/main (2026-07-03).

## Backlog (unscoped / later)

- **ultradraft mode** (cloud-based design iteration)
- **Context compaction resilience testing**
