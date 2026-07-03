---
Status: draft
Date: 2026-07-03
Assessment: assessments/progressive-disclosure.md
Likely-supersedes: (none; absorbs the /hey and git-setup-tutorial roadmap items)
---

# Progressive Disclosure — Desired State

Make philset **reveal complexity only as the user is ready for it** — across
onboarding, session-start, in-skill nudges, and its own updates. One user-facing
knob (`disclosure`) tunes how much philset proactively surfaces; one architectural
principle (**plugin is the floor, MCP is the top of the ladder**) keeps it offline
by default while allowing a zero-friction install and an opt-in update channel.

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

**Experience axis — the `disclosure` level.** A single signpost level tunes how
much philset proactively offers, spanning session-start weight (surface 2) and
in-skill nudges (surface 3):

| `disclosure:` | Session start | In-skill nudges | Who |
|---------------|---------------|-----------------|-----|
| `minimal` | `/hey`-weight, no optional checks | rare, only high-value | senior eng |
| `standard` (default) | `/hello` base + opted-in checks | natural next-step nudges | most users |
| `guided` | `/hello` + proactive opt-in offers | eager, cross-domain, teaches the workflow | novice / non-code / writer |

`disclosure` is inherited down the tree (child overrides), same as every signpost
flag. It's the knob that makes the *same skillset* feel right for both a senior
engineer and a writer — the core progressive-disclosure move.

---

## Phase 0 — the session-start floor *(near-v0.3, no external dep)*

### `/hey` — the lightweight session floor
The third floor below `/hello`. Loads **light, local context only**: cwd `.meta/`
(decisions, in-progress, current branch), *no* full tree walk, *no* MCP/API reads.
A `/riff`-style **escalation gate**: if the session deepens (feature work, a
cross-project reference, a design ask), offer to run full `/hello`. Absorbs the
roadmap `/hey` item. At `disclosure: minimal`, `/hey` is the implied default
session-start.

### `hello.check: [...]` — the session-start check list
Generalize the one-off `calendar` flag into a **uniform opt-in list** of optional
session-start checks `/hello` runs. First-class entries:

```yaml
# signpost.yml
disclosure: standard
hello:
  check: [calendar, connectors, updates]   # run these optional checks at /hello
```

- `calendar` — today's calendar (supersedes the standalone `calendar: true` flag;
  keep `calendar: true` as a back-compat alias that maps to adding `calendar` to
  the list). *(Open Q1: migrate or alias?)*
- `connectors` — the connector-health check (absorbs that roadmap item): flag stale
  MCP/API auth up front.
- `updates` — the `mcp.philbas.com` updates pull (Phase 3). **Listing it here is
  the opt-in; omitting it is the opt-out** — one uniform control, per Phil.
- Unlisted checks don't run. Default list is conservative (empty or `[]`), so a
  fresh install assumes nothing (fixes "`/hello` shouldn't assume calendar").

`hello.check` is an instance of the **per-skill-config convention** just shipped
via `review.dimensions` — same namespace pattern (`<skill>.<field>`), same tree
inheritance. This is the convention generalizing on its second consumer.

## Phase 1 — the per-skill suggestion layer *(no external dep, philset-native)*

Turn the *emergent* nudges ("ready for `/review`?", "elevate to `/draft`?") into a
**deliberate, encouraged, tunable convention**. Shape:

- A `references/disclosure.md` convention doc that skills reference: *when* to
  offer a next step, *how* to phrase it (offer, never force), and the
  `disclosure`-level gating (minimal = rare; guided = eager).
- **Next-step nudges** (within the workflow): the assess→draft→ship→review→ttyl
  transitions, already partly present, made consistent.
- **Cross-domain nudges** (the new, higher-value part): skills notice when *another*
  skill would serve the user's actual goal —
  - "You're writing a chapter set in a culture you don't belong to — want to
    `/study` its history first?"
  - "I can't give financial advice, but we could `/study` the instruments you have
    in mind, then `/draft` a strategy together."
  These are **opt-in offers**, gated by `disclosure` (silent at `minimal`, eager at
  `guided`). They're what makes philset *teach* its own workflow to a novice.
- **The offer is a fork, not a command** — the user can decline and continue; the
  nudge never blocks.

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

---

## Staging → roadmap

| Phase | Scope | External dep | Disposition |
|-------|-------|--------------|-------------|
| **0** | `/hey` + `hello.check` list | none | **build now / near-v0.3** |
| **1** | per-skill suggestion layer + `disclosure` level | none | **build now / near-v0.3** |
| 2 | plugin distribution | Claude Code plugin system | `/defer` — post-v0.3-cut, pre-philbas-copy |
| 3 | MCP enhancement (updates + onboarding assist) | `mcp.philbas.com` | `/defer` — after Phase 2 |

`/ship` implements Phases 0–1 (multi-stage-ship: accept, build the no-dep floor,
`/defer` 2–3 with provenance). `disclosure` + `hello.check` land together since
Phase 1's nudges read the same knob Phase 0 introduces.

## Tradeoffs

- **One `disclosure` level vs. per-surface flags.** A single knob is legible and
  makes the "same skillset, different audience" story crisp; the cost is coarseness
  (you can't say "guided nudges but minimal session-start"). *Chosen:* one level +
  `hello.check` as the finer session-start control underneath it. Revisit if users
  want per-surface granularity.
- **Migrate `calendar: true` → `hello.check: [calendar]` vs. keep both.** Migration
  is cleaner long-term; an alias avoids breaking existing signposts. *Leaning:*
  alias now (pre-v1 has no back-compat tax, but this one's nearly free and avoids a
  flag-day). Open Q1.
- **Plugin vs. staying npm-first.** Plugin is the grounded path to easy onboarding
  and supersedes the symlink mess; but it's a distribution rewrite and adds the
  Claude-Code-plugin surface to learn. *Chosen:* plugin (Phase 2) — the onboarding
  win is the whole point of surface 1, and it resolves deploy-vs-symlink anyway.
- **MCP updates: pull vs. push.** Pull-at-`/hello` is simple and user-visible; push
  (MCP channels) is real-time but overkill and more invasive. *Chosen:* pull.
- **Nudges: offer vs. auto-run.** Auto-running a suggested skill would be faster but
  violates the "offer, never force" principle and the trust model. *Chosen:* always
  offer.

## Open Questions

1. `calendar: true` — migrate to `hello.check: [calendar]`, or keep as an alias?
2. Default `hello.check` value — empty `[]`, or a minimal safe default?
3. Does `disclosure: guided` change *wording/verbosity* only, or also *which
   steps* run (e.g. auto-offer scaffolding help)? How much is too much hand-holding?
4. Where does the `disclosure` level default live for a *fresh* install — plugin
   default, or asked once at first `/hello`? (Ties to Phase 2.)
5. Should `/hey`'s escalation gate auto-escalate on certain triggers, or always ask?
6. Phase 1 cross-domain nudges: how does a skill *detect* the opportunity ("writing
   about an unfamiliar culture") without being preachy or wrong? Guardrails?

## Out of Scope

- **Phases 2–3 implementation** — designed at the shape level here, `/defer`red to
  their own `/draft`s + roadmap stages.
- **The actual `mcp.philbas.com` server build** (Praxis/infra work, cross-deferred).
- **Real-time push** (MCP channels) — pull model only.
- **Non-code dimension sets, git-integration:false** — separate threads, not this.
