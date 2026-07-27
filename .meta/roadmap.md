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

- **README update — cover changes since the voice pass** *(brand/onboarding —
  both audiences; Phil-solo voice work)* — **Audited 2026-07-03 (v0.3 riff):** the
  voice pass is *done* (README reads for humans, essay-voiced — the "for-humans"
  goal is met). What's stale is **coverage** — the README documents the *old*
  library and predates half the current skills. Punch-list for the update:
  - **Add the 7 missing skills** — `/riff`, `/defer`, `/amend`, `/triage`,
    `/study`, `/skim`. The Lifecycle/Workday cadence tables list only `/hello`,`/ttyl` /
    `/assess`,`/draft`,`/ship`,`/review`. Reframe around the gradient-of-altitudes
    model (mechanical → riff → amend → draft → study/skim) from the dev-state assessment.
    (`/skim` shipped 2026-07-13 as `/study`'s breadth-first sibling.)
  - **Non-code positioning** — a section: philset works for non-code artifacts
    (which skills are concept-general, the `architecture: false` hatch, the
    `/review`-is-code-shaped caveat, a pointer to the future git-setup tutorial).
  - **`/ship` human-as-implementer note** (from `inbox/human-implements.md`, still
    unapplied): the `/ship`→`/review` loop works even when the *human* implements
    (design doc = spec; `/review` compares the artifact regardless of who built it).
  - **Formalize "external writes go through inbox"** as a stated principle *(was
    Tier 4)*.
  - `private-meta`/`philset private` already added (v0.3 Target 1).
  Backing inbox file: `human-implements.md` (valid gap). `anecdotes.md` → case-study
  material, not README-structural. `readme-context.md` graduated (applied).
  Voice-heavy → Phil's solo author time; **/deferred out of the v0.3 build**
  (2026-07-03). **Release call RESOLVED (2026-07-03): FAST-FOLLOW, does not gate
  the cut** — v0.3 cuts now on the coverage-stale README; this lands right after.
  (Briefly set to "gate" then reversed same day — Phil implements the README solo
  and doesn't want it blocking the tag.) **Accepted 2026-07-03** (`/ship`) →
  `designs/readme-coverage-update.md` (feature/readme-coverage-update), first-pass
  prose for all 6 changes written in-doc; **Phil implements** (human-as-implementer),
  then `/review`. Roadmap item graduates when the README actually lands.
  Deferred from: philset/riff/v0.3-portable-welcoming (2026-07-03).

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
  - **PM-integration signpost flag** *(merged 2026-07-22 from todo)* — a flag
    that has skills push status updates to an external PM/ticket system as work
    progresses; Stage 3-adjacent (external ticket systems generalize the Praxis
    leaf-sync). Deferred from: career/meta/heading-adjustment (2026-07-12).
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

### Progressive disclosure — staged (from `designs/progressive-disclosure.md`, 2026-07-03)

Phase 0 (`/hey` + `hello.check`) shipped in feature/progressive-disclosure. The
rest is staged here; all trace to the accepted design.

- **Self-calibrating disclosure** — learn the user's preferred `/hello` verbosity
  (and other interaction settings) by observation + light questions over the first
  N sessions, persist, allow correction — the "Random meets the Guide" pattern.
  **Second instance of the self-calibrating-preferences primitive** shipped as
  `review.dimensions`; generalize the primitive out of `/review` when building it.
  Feedback-gated (needs real usage to tune; over-eager calibration is the failure
  mode). Manual `/hey`/`/hello` floor is the v0.3 stand-in.
  Deferred from: philset/feature/progressive-disclosure (2026-07-03).

- **Convention auto-updating** — `/hello` detects out-of-date philset conventions
  (e.g. a bare `calendar: true` → `hello.check`) and fixes them **with consent**,
  gated on a signpost flag, rather than one-off aliases forever. Phil's preferred
  way to handle convention churn generally. Same family as self-calibrating prefs.
  Deferred from: philset/feature/progressive-disclosure (2026-07-03).

- **Per-skill suggestion layer + cross-domain nudges (Phase 1)** — make the
  emergent next-step nudges deliberate + encouraged, and add cross-domain offers
  ("`/study` before `/draft`ing a strategy?"). Rides on the self-calibrating
  verbosity layer for eagerness-gating; needs guardrails for *detecting* the
  opportunity without being preachy/wrong (Q6).
  Deferred from: philset/feature/progressive-disclosure (2026-07-03).

- **Phase 2 — plugin distribution** — repackage philset as a Claude Code **plugin**
  + marketplace (`/plugin install philset` → `/hello` scaffolds locally). The real
  onboarding win; grounded as the only mechanism that can distribute skills (remote
  MCP can't). **Absorbs/supersedes:** the git-setup tutorial (below — becomes the
  plugin's `guided` first-run), **deploy-vs-symlink** (Tier 1 — plugin is the
  distribution mechanism; `npm run link` stays dev-only), and the **work-laptop
  release** (Tier 1 — "install the plugin"). **Timing: after cutting v0.3, before
  rewriting the philbas.com copy.**
  **Cowork/marketplace confirmation (merged 2026-07-22 from todo):** Cowork has
  a plugins marketplace — plugins bundle skills/slash-commands/sub-agents/
  connectors; Anthropic ships a default "Knowledge Work" marketplace and
  supports adding marketplaces from a GitHub repo; the same plugin skills run
  across web/Desktop/Cowork (refs: anthropics/knowledge-work-plugins,
  claude.com/blog/cowork-plugins). Cooperate-with-Anthropic play. **Open
  question:** skills are the right primitive already, but the `.meta/` tree +
  tree-walk context model likely needs adaptation for Cowork's environment.
  Related: orientation-page copy currently assumes the npm install (ship as
  plugin now vs. rewrite copy after — tradeoff lives in the philbas.com
  orientation-page draft).
  Deferred from: philset/feature/progressive-disclosure (2026-07-03) +
  philbas.com/feature/philset-orientation-page (2026-07-03).

- **Phase 3 — MCP enhancement layer** — stand up `mcp.philbas.com` as the opt-in
  top-of-ladder: the `updates` `hello.check` (pull-at-session-start, user-visible,
  never auto-applied — trust model in the design) + guided onboarding assist.
  Depends on Phase 2. Capacity trivial (~12 QPS at 100k users; a CF Worker at ~$0);
  the real cost is the trust/verification model. Server build cross-defers to Praxis/infra.
  Deferred from: philset/feature/progressive-disclosure (2026-07-03).

- **Git-setup tutorial for non-devs — wants its own `/draft`** *(now Phase 2's
  `guided` first-run — see above)* — Pulled out of the
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

- **`/sprout` — organically extend a tree without disrupting it** *(consolidated
  2026-07-22 from three scattered entries: todo item, Backlog "Sprout a domain
  primitive", heading-adjustment "/sprout formalization")* — A skill for growing
  a new layer of an existing tree structure in place: a new directory level in
  the `.meta/` hierarchy, a new archetype in a family, a context cluster promoted
  to its own domain. **Hand-performed three times** (study/ 2026-06-28,
  plastic-labs 2026-07-06, wotr/social per heading-adjustment) — steps known:
  detect promotion, create domain skeleton (`.meta/` with signpost/README/state
  files), move state down, lift shared state up, sweep scattered docs in, move
  owned sub-repos under (gitignored, history intact), seed `roadmap.md` from
  deferrals, scaffold siblings, reconcile tree walk, leave pointers + decision
  trail. Superset of chunk 5's `philset mv` (sprout = create-domain + mv +
  seed-state). Also surfaced for archetype families ("tired of the same three
  overrides → sprout a new noun").
  Deferred from: pattern-language draft (Development/.meta, 2026-07-09) +
  meta/interview-prep (2026-07-06) + heading-adjustment (2026-07-11).

- **Formalize `/bet`** *(promoted 2026-07-22)* — Full specimen exists
  (gaming/grim-dawn/.meta/bets/neris-line/ + designs/bet-prediction-system.md +
  postvivem). Shape: `bets/<name>/` layout (evidence / domain-notes /
  prediction-per-envelope / scoring / postvivem); two species (sealed-ante vs
  futures — the inline chassis wager is the futures specimen); verbs
  open/seal/reveal/settle; pre-registered predictions with confidences + Brier
  calibration + Δ-between-rounds as the system grade; the postmark principle
  (envelope exteriors fair game, contents sealed) pending ratification;
  scoreboard braid (house vs disagreement bets) undesigned.
  - **Sealed-path isolation as a first-class subagent parameter** *(backing
    note, same run)* — the bet's orchestration problem was *isolation*, not
    parallelism: research subagents provably unable to touch `.meta/ante/`.
    Solved with web-only agents + explicit no-local-files instructions; the
    formal treatment (per-agent path exclusions in skill/agent definitions)
    belongs in the philset orchestration answer alongside fan-out patterns.
  Deferred from: gaming/grim-dawn neris-line /bet run (2026-07-18).

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
  **Partially delivered 2026-07-03:** the `/review` slice (`review.dimensions` /
  `review.extra-dimensions`) is designed + shipping via
  `designs/configurable-review-dimensions.md` (the proving ground). The general
  per-skill-config convention (other skills, the `review.*` namespace pattern
  generalized) remains here.

- **`architecture-doc` signpost flag — CLAUDE.md as the architecture doc**
  *(promoted 2026-07-22 from email inbox)* — Company repos (all of
  plastic-labs, probably beyond) ship a CLAUDE.md that already documents
  architecture; a separate `.meta/logical-architecture.md` is redundant and
  drifts. Flag names the file that IS the architecture doc (e.g.
  `architecture-doc: CLAUDE.md`); when set, `/hello` skips the
  logical-architecture offer and architecture-change tracking targets that file.
  Inherited down the tree (one line at plastic-labs covers every repo).
  **Stopgap already live on the work machine:** `architecture: false` (does the
  suppression today) + inert forward-compat `architecture-doc: CLAUDE.md` in
  `plastic-labs/.meta/signpost.yml` — when the library learns the flag, that
  config should Just Work. Design checklist in the backing email: flag shape
  (separate vs. overloading `architecture:` — separate is cleaner, overload is
  fewer flags), `/hello` step-4 changes, where `/review`'s architecture
  dimension reads from, staleness-nudge parallels, unset = current behavior.
  Same family as signpost per-skill config (below).
  Backing inbox file: the "formalize CLAUDE.md as architecture doc" email.
  Deferred from: plastic-labs work machine (2026-07-22, via email inbox).

- **`/postmortem` skill — formalize the incident-writeup improvisation**
  *(promoted 2026-07-22)* — Capture a production incident as a structured
  postmortem: symptom → root cause → fix → approaches-tried-and-rejected →
  lessons → files changed. Improvised once (Praxis tutorial-hotfix 2026-04-19,
  now at `praxis/.meta/postmortems/2026-04-19-tutorial-hotfix.md`). Cousin to
  `/retro` (session friction) but aimed at *production* incidents; output is a
  durable, citable incident doc. The specimen already has the section shape.
  Deferred from: career/meta/heading-adjustment (2026-07-12, repo audit).

- **`/clear-inbox` skill — normalize dropped files** *(promoted 2026-07-22)* —
  Auto-rename inbox files to a consistent scheme (strip spaces, kebab-case,
  maybe date-prefix) so screenshots, emails, and dropped references don't
  collide or read as noise. Small, self-contained tooling.
  Deferred from: career/meta/heading-adjustment (2026-07-12, repo audit).

- **`/draft` Step 0 non-repo fallback** *(promoted 2026-07-22)* — In a non-repo
  project there's no branch to check and no commit to serve as a seal.
  Formalize the improvised fallback (SHA-256 content hash appended to
  append-only `decisions.md` as the pre-registration seal) + add a git-init
  nudge now that proactive commits are ratified (root WORKFLOW.md, 2026-07-18).
  Deferred from: gaming/grim-dawn neris-line /bet run (2026-07-18).

- **Name the consent-by-charter pattern** *(promoted 2026-07-22)* — What gates
  `/ship` when the counterpart is autonomous: a standing document (bet.md's
  blanket strategy freedom) authorizes a class of decisions, and the artifact
  trail substitutes for the live mutual-consent loop (mid-run inline annotation
  as the async consent channel). Where's the line? Deserves a written answer in
  the philset docs; relates to the pattern language.
  Deferred from: gaming/grim-dawn neris-line /bet run (2026-07-18).

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

- ~~**`copyDirRecursive` dereferences symlinked *sources***~~ **DONE 2026-07-27**
  (`b167b3e`). Dereference chosen over skip. Correction to the original entry: the
  errno is `EISDIR` on Linux but **`ENOTSUP` on macOS**, and this was **live, not
  latent** — `philset sync` broke on the first entry on any dev box. Dangling links
  now skipped; `test/sync.test.js` (4 cases) added to `npm test`.
  Deferred from: philset/riff/v0.3-portable-welcoming (2026-07-03, /review).

- ~~**Extract hardcoded meta-README from `/hello`**~~ **DONE 2026-07-27** (`b167b3e`)
  — Step 3 now points at `templates/meta-README.md`; the blocks were byte-identical.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).

- **Extract a shared orientation + tree-walk snippet for `/hey` + `/hello`** —
  `/hey` now restates the orientation (plan-override, auto-`/retro`/`/defer`,
  cadences) and the tree-walk mechanics that `/hello` already owns, so the two
  skills carry near-duplicate blocks. DRY them into a shared reference both point
  at (mirrors the meta-README extraction above; a single "philset session
  primitives" doc could absorb both). Watch the divergence points: `/hey`'s walk
  is *minimal* (flags + root `WORKFLOW.md`), `/hello`'s is *full* — the shared
  snippet needs a minimal/full parameter, not a blind copy.
  Deferred from: philset/feature/hey-minimal-tree-walk (2026-07-03, /review).

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
- **`/address` — the autonomous sibling to `/defer`** *(far-future; pre-draft
  vision, promoted 2026-07-22)* — Where `/defer` parks ("this matters, not
  now"), `/address` dispatches ("small enough to knock out on your own"):
  originating session writes a task spec to the target repo, spawns a headless
  session with self-shipping permissions, the dispatched session runs the
  normal philset flow (the paper trail IS the autonomy), and a
  `ratifications.md` queue holds autonomously-shipped changes for sign-off at
  the next partnered session (`/hello` surfaces pending ratifications).
  Open threads: bounding vs. the human-implements microethic; per-project vs.
  root-tree queue; provenance chain back to the originating call; stuck/wrong
  failure path (revert via the ratification gate); reuse `/ship`+`/review` or
  its own headless review bar. **Cross-ref: the commit-convention signpost flag
  (Tier 4)** — the git-autonomy toggle `/address` needs (`autonomy: self-ship`?)
  is plausibly the same signpost surface; the skill and its enabling setting
  may co-design.
  Deferred from: career/main (2026-07-19).
- **Archetype skill-behavior layer** *(merged 2026-07-22; gated on the pattern
  language shipping + the `philset-archetypes/` repo existing)* — two pieces:
  - **"Working with archetypes" gloss on `/draft` + `/ship`** — `/draft` from an
    archetype renders the slot consent-block at the top of the delta-doc,
    pre-seeds the outline from the slot list, blocks on required default-less
    slots; `/ship` writes the archetype-version pin into frontmatter; archetype
    files resolve from the runtime source (local `philset-archetypes/` clone →
    else `mcp.philbas.com/archetypes`).
  - **Placeholder-reference reconciliation** — on minting a new archetype, check
    existing entries for placeholder references to it (Worker's `Composes`
    naming "KV" pre-mint) and redirect to the new noun; a signpost flag on
    `philset-archetypes` + an extra step in `/draft`/`/ship`/`/review`. The
    forward-reference analogue of composition-by-rule (pattern-language.md §3).
  Deferred from: pattern-language draft + philset-archetypes/feature/
  trunk-archetypes (2026-07-09).

## From heading-adjustment (2026-07-11) — un-tiered; sort at next philset session

_(from: ~/Development/.meta/designs/heading-adjustment.md M3)_

<!-- /skim skill — shipped 2026-07-13 (see archive/rearview.md); graduated off this list. -->

- **OpenSpec integration exploration** — /skim OpenSpec first, then explore the "yes and":
  an OpenSpec companion doc alongside the /draft design doc (spec = precision/density;
  design doc = nuance, decision tracking, altitude flow). Assessment verdict: closest
  lifecycle neighbor on the shelf (§2.2).
- **Calendar writes in /defer** — date-carrying deferrals land on the calendar
  (Google Calendar MCP), not just todo.md.
- **Workday-vs-session cadence redesign** — context-window-management reframe: /hello opens
  a workday, sessions reset within it; /ttyl robust to falling-asleep-mid-session
  (retroactive tidy is the norm, not the exception). Chunk-2-adjacent.
- **README/docs refresh — PROMOTED near-term** — six skills missing from tables; two
  non-phil users exist. Bundle with: governance repositioning (decisions-as-provenance,
  amend-without-supersede, defer/triage, /study, consent slots — the rare-on-shelf set per
  ai-ecosystem-integration §2.2), marketplace/plugin listing, one mechanical-verification
  hook for /review.
<!-- /sprout formalization — consolidated 2026-07-22 into the Tier 3 /sprout item. -->
- **Weekly-digest autogen** — compile the week's decisions/commits/design-diffs + metrics
  (tokens, hours; product SLIs later) into the Tier-1 digest (heading D2). A skill or
  /ttyl-adjacent script; feeds the social pipeline.
