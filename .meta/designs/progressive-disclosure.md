---
Status: accepted
Date: 2026-07-03
Accepted: 2026-07-03
Implemented: 2026-07-03 (feature/progressive-disclosure) — Phase 0 only
Divergences: none
Deferred: Phases 1–3 + self-calibrating disclosure + convention-auto-updating (all staged in roadmap.md)
Assessment: assessments/progressive-disclosure.md
Supersedes: (none; Phase 0 absorbs the /hey + connector-health roadmap items; Phase 2 absorbs git-setup-tutorial)
---

# Progressive Disclosure — Desired State

Make philset **reveal complexity only as the user is ready for it** — across
onboarding, session-start, in-skill nudges, and its own updates. philset
**self-calibrates to the user** (à la the Guide Mark II bird — observe, converge,
persist, allow correction) rather than making them pick a preset; and one
architectural principle (**plugin is the floor, MCP is the top of the ladder**)
keeps it offline by default while allowing a zero-friction install and an opt-in
update channel. **v0.3 builds only the manual floor (`/hey`/`/hello` +
`hello.check`); the self-calibrating layer and everything network-touching defer.**

---

## 0. The load-bearing decision: the disclosure ladder

Two axes, resolved up front (both grounded in the assessment):

**Architecture axis — plugin floor, MCP ladder.** philset stays offline and
dependency-free at its floor. Distribution is a **Claude Code plugin** (bundles
skills; installs via marketplace); the **`mcp.philbas.com` connection is an
optional enhancement** (richer onboarding, updates) a user opts into. philset
never *requires* the network — it's *better* with it. This resolves the
CLAUDE.md "no dependencies beyond Node builtins" tension: the floor honours it;
the ladder is opt-in.

**Experience axis — self-calibrating, not preset.** The interaction surface
between Claude and the user is highly configurable, but the user shouldn't have to
*pick* a configuration up front. Like the Guide Mark II bird calibrating itself to
Random — probing, watching reactions, homing in on the config that fits *her* —
philset should **learn** the user's preferred verbosity by observation + light
questions over the first N sessions, persist it, and let them correct it. (The
bird also *overshoots* first — "obviously way too many" birds — before converging;
over-eager calibration is the failure mode, which is why we start manual.)

**This is a primitive we already shipped today.** The `/review` dimension loop
(infer → breadcrumb → N=3 auto-persist → `/retro` correct) *is* this mechanism in
miniature. Naming it:

> **Self-calibrating preferences** — a philset primitive: the agent infers a
> per-user/per-project setting from observation, persists it (breadcrumb →
> signpost), and lets the user correct it. **Instances:** `review.dimensions`
> (shipped), disclosure-verbosity (deferred, below), convention auto-updating
> (Q1, same family).

**v0.3 = the manual floor (the N=0 "user declares" case).** `/hey` = sparse,
`/hello` = verbose; the user picks by which they type. The *self-calibrating*
verbosity layer — learn the preference, persist, correct — is **deferred**: it
needs real usage to design the observation heuristics, and it's the second
consumer that will generalize the self-calibrating-preferences primitive out of
`/review`. Manual now, smart later.

---

## Phase 0 — the session-start floor *(near-v0.3, no external dep)*

### `/hey` — the lightweight session floor
The third floor below `/hello`. Loads **light, local context only**: cwd `.meta/`
(decisions, in-progress, current branch), *no* full tree walk, *no* MCP/API reads.
Absorbs the roadmap `/hey` item. `/hey` is the "sparse" choice; `/hello` the
"verbose" one — the manual verbosity floor.

**Escalation gate (Q5):** `/hey` **auto-escalates** to the relevant `/hello` step
when the session needs more context than the local directory holds (feature work
spanning the tree, a cross-project reference, a design ask) — no need to ask. But
**network/opt-in checks are exempt from auto-escalation**: a `/hey` session never
fires the `updates` MCP check or other `hello.check` network entries, even after
escalating. Auto-pull *local* context; never auto-reach the network.

### `hello.check: [...]` — the session-start check list
Generalize the one-off `calendar` flag into a **uniform opt-in list** of optional
session-start checks `/hello` runs. First-class entries:

```yaml
# signpost.yml
hello:
  check: [calendar, connectors]   # optional checks /hello runs (updates deferred)
```

- `calendar` — today's calendar. **`calendar: true` is kept as a back-compat alias**
  (maps to adding `calendar` to the list) rather than a migration — resolved Q1;
  the general "auto-fix stale conventions on consent" idea is its own deferred
  design (see Staging).
- `connectors` — the connector-health check (absorbs that roadmap item): flag stale
  MCP/API auth up front.
- `updates` — the `mcp.philbas.com` updates pull. **Documented here as the future
  opt-in, but NOT active in v0.3** (Phase 3 — even *checking* it is out of scope,
  per Phil). Listing-is-opt-in / omitting-is-opt-out is the uniform control once it
  exists.
- Unlisted checks don't run. **Default: `[]`** (resolved Q2/Q2b) — a fresh install
  assumes *nothing* and runs no optional checks; every check is explicit opt-in.
  Fixes "`/hello` shouldn't assume calendar" completely. (`connectors` only matters
  once an MCP is connected, so there's no value defaulting it on.)

`hello.check` is an instance of the **per-skill-config convention** just shipped
via `review.dimensions` — same namespace pattern (`<skill>.<field>`), same tree
inheritance. This is the convention generalizing on its second consumer.

## Phase 1 — the per-skill suggestion layer *(DEFERRED — not v0.3)*

Turn the *emergent* nudges ("ready for `/review`?", "elevate to `/draft`?") into a
**deliberate, encouraged convention** — and add *cross-domain* nudges (skills
noticing when *another* skill serves the user's real goal: "want to `/study` this
before `/draft`ing a strategy?"). The offer is always a fork, never a command.

**Deferred to its own roadmap item.** Two reasons surfaced in iteration:
- **Cross-domain nudges are out of scope for v0.3** (Q6) — detecting the
  opportunity without being preachy or wrong (the "unfamiliar culture" example is a
  stretch) needs its own design + guardrails.
- The nudge *eagerness* was going to be gated by the `disclosure` level, which is
  now the **deferred self-calibrating-verbosity layer**. Phase 1's gating rides on
  that. Meanwhile the *emergent* next-step nudges continue as they are today.

## Phase 2 — plugin distribution *(deferred to roadmap; own design + build)*

**Timing (Phil):** after cutting v0.3, before rewriting the philbas.com copy.
Repackage philset as a **Claude Code plugin** + marketplace. Grounded target flow
(from the assessment):

1. Install Claude Code.
2. `/plugin marketplace add philosaether/philset` → `/plugin install philset`.
3. Open a directory, `/hello` (or `/hey`) — Claude scaffolds `.meta/` locally.

→ ~2 commands + `/hello`, no `npm`/`init`/dir-dance. **Supersedes the current
npm/init install story** and resolves the deploy-vs-symlink thread (the plugin is
the distribution mechanism; `npm run link` stays the dev-only path). **Braids in
the deferred git-setup onboarding** (Phil's annotation): the plugin's first-run,
at `disclosure: guided`, walks a non-dev through git setup (git stays; the guided
flow teaches it). Absorbs the work-laptop-release thread as "install the plugin."

*Design-level only here; full spec is its own `/draft` when Phase 2 starts.*

## Phase 3 — the MCP enhancement layer *(deferred to roadmap; depends on Phase 2)*

Stand up `mcp.philbas.com` as the optional top-of-ladder. Two jobs:

- **Updates channel** — a pull-at-session-start MCP **resource** the `updates`
  check (Phase 0's `hello.check`) reads: `{latest_version, migration_needed,
  notices:[...]}`. Surfaced in the `/hello` summary, **never silently applied.**
- **Onboarding assist** — richer, guided setup instructions the plugin's first-run
  can fetch (the MCP *returns data*; Claude's local tools execute — remote MCP
  can't write local files).

**Trust model (the real risk, not capacity — assessment §Trust):** opt-in (via
`hello.check`), user-visible (shown, never auto-applied), **bounded** (news +
version signals + *offered* migrations, NOT arbitrary instruction injection into
skills without consent), ideally signed/provenanced. An un-trustworthy update
channel is its own liability — "won't get sued" cuts both ways.

**Capacity:** trivially cheap (~12 QPS at 100k users; a Cloudflare Worker serving
cached JSON at ~$0 — assessment §Capacity). Not a scaling concern.

*Design-level only here; full spec is its own `/draft` when Phase 3 starts.*
**Confirmed: even *checking* `/updates` is out of scope for v0.3** — the `updates`
entry is documented in `hello.check` as the future opt-in, but nothing queries the
network until Phase 3.

---

## Staging → roadmap

| Item | Scope | External dep | Disposition |
|------|-------|--------------|-------------|
| **Phase 0** | `/hey` (+ escalation gate) + `hello.check` list | none | **build now / v0.3** |
| Self-calibrating disclosure | learn verbosity pref over N sessions; 2nd instance of the `review.dimensions` primitive | none | `/defer` — feedback-gated, iterative |
| Convention auto-updating | `/hello` detects + fixes stale conventions *with consent* (a signpost flag); generalizes the `calendar`-alias case (Q1) | none | `/defer` — own design pass |
| Phase 1 | per-skill suggestion layer + cross-domain nudges | none | `/defer` — rides on self-calibration; Q6 guardrails |
| Phase 2 | plugin distribution | Claude Code plugin system | `/defer` — post-v0.3-cut, pre-philbas-copy |
| Phase 3 | MCP enhancement (updates + onboarding assist) | `mcp.philbas.com` | `/defer` — after Phase 2 |

**Only Phase 0 ships in v0.3.** `/ship` implements it (multi-stage-ship: accept,
build the no-dep floor, `/defer` the rest with provenance). Everything else is
captured above as staged roadmap items.

## Tradeoffs

- **Preset `disclosure` level vs. self-calibration vs. manual floors.** A preset
  level (minimal/standard/guided) is legible but is exactly the "make the user
  choose" the Guide-bird pattern rejects. Full self-calibration is the target but
  needs real usage to tune and risks over-eager nagging (the bird's "too many
  birds" overshoot). *Chosen:* manual floors (`/hey`/`/hello`) for v0.3 — the honest
  N=0 case — with self-calibration deferred as the second instance of the
  `review.dimensions` primitive. Revisit once there's usage signal to learn from.
- **Migrate `calendar: true` → `hello.check: [calendar]` vs. keep both.** *Resolved
  (Q1):* keep `calendar: true` as an **alias** now; the general question of
  auto-updating stale conventions (with consent) becomes its own deferred design,
  rather than a one-off migration here.
- **Plugin vs. staying npm-first.** Plugin is the grounded path to easy onboarding
  and supersedes the symlink mess; but it's a distribution rewrite and adds the
  Claude-Code-plugin surface to learn. *Chosen:* plugin (Phase 2) — the onboarding
  win is the whole point of surface 1, and it resolves deploy-vs-symlink anyway.
- **MCP updates: pull vs. push.** Pull-at-`/hello` is simple and user-visible; push
  (MCP channels) is real-time but overkill and more invasive. *Chosen:* pull.
- **Nudges: offer vs. auto-run.** Auto-running a suggested skill would be faster but
  violates the "offer, never force" principle and the trust model. *Chosen:* always
  offer.

## Resolved / Deferred (was Open Questions)

- **Q1 — `calendar` migrate vs. alias:** *keep as alias now*; the general
  "auto-update stale conventions with consent" behavior is its own **deferred**
  design (Phil's preferred future: `/hello` detects + fixes stale conventions
  without asking, gated on a consent signpost flag). → Staging item.
- **Q2 — default `hello.check`:** a **minimal opinionated default**, not empty.
  *Remaining open (Q2b):* is `[connectors]` right, given it only bites once an MCP
  is connected — or is the true default `[]` until something's connected? (Small;
  settle in `/ship`.)
- **Q3 / Q4 — `guided` verbosity + fresh-install default:** *dissolved* by the
  self-calibration reframe. There is no preset level to configure; verbosity is
  learned (deferred) and, for v0.3, chosen manually via `/hey` vs `/hello`.
- **Q5 — `/hey` escalation:** *auto-escalate* when the session needs more than
  local context; **network/opt-in checks exempt** (never fire the `updates` MCP
  check on a `/hey`). Specified in the `/hey` section.
- **Q6 — cross-domain nudge detection:** *out of scope for v0.3* — punted to the
  deferred Phase 1 roadmap item (needs guardrails; the example was a stretch).

## Out of Scope

- **Phases 2–3 implementation** — designed at the shape level here, `/defer`red to
  their own `/draft`s + roadmap stages.
- **The actual `mcp.philbas.com` server build** (Praxis/infra work, cross-deferred).
- **Real-time push** (MCP channels) — pull model only.
- **Non-code dimension sets, git-integration:false** — separate threads, not this.
