# Assessment: Progressive Disclosure (a cross-cutting philset pattern)

Date: 2026-07-03
Branch: main

Progressive disclosure = reveal complexity only as the user is ready for it. This
assessment maps four surfaces where philset could apply it, grounds the external
feasibility (MCP/plugins) in real Claude Code docs, and surfaces the offline/no-dep
tension — so a single comprehensive `/draft` can consume it and stage across
roadmap phases.

## Current State

**The pattern already exists implicitly** — philset surfaces recommendations
naturally ("ready for `/review`?", "time for `/ttyl`?", agent-invoked `/defer`).
What's missing is (a) making it *explicit and deliberate*, and (b) applying it to
*onboarding* and *feature-gating*, not just skill transitions.

**Surface 1 — Install/bootstrap.** Today: `npm install` → `philset init` (prompts
for root dir, `git init`s root `.meta`, copies skills globally) → make a project
dir under root → `cd` → `philset begin`/`dsp` (scaffold + launch). ~5–6 steps,
Node/npm/CLI literacy assumed. Trivial for a senior eng; hoops for a writer. The
`philset dsp` shorthand exists but you have to *discover* it.
- Also, the git setup onboarding flow we deferred this morning

**Surface 2 — Runtime feature-gating.** `/hello` is **273 lines, 8 steps**
(0–7 + 6.5-calendar) and growing. It already gates calendar behind a `calendar`
signpost flag (opt-in, degrades silently). But there's no general "which checks
run at session start" control, and no floor lighter than full `/hello`. `/hey`
(lightweight `/hello`) is designed and on the roadmap (Tier 2) but unbuilt.

**Surface 3 — Per-skill suggestion layer.** Nudges are emergent and inconsistent
— they happen when the agent thinks of them, not by a deliberate pattern. No
cross-domain suggestions ("`/study` this culture before writing the chapter").

**Surface 4 — Agent-facing update channel.** Doesn't exist. philset skills are
static once installed; a bugfix or legal-language hotfix reaches users only when
they manually `philset update` (which itself is broken on dev boxes — see the
deploy/symlink work). No way to push "updates available" or corrected instructions.

## Feasibility (grounded in current Claude Code docs — the reality contact)

*Sourced from a claude-code-guide research pass over official docs, 2026-07-03.*

**The zero-config MCP vision does NOT work as imagined.** Two hard boundaries:
- **Remote MCP servers are sandboxed — they cannot write to the user's local
  filesystem.** So `mcp.philbas.com` *cannot* scaffold `~/.claude/skills/`, create
  dirs, or install anything locally. It can only *return data*; Claude Code's own
  `Write`/`Bash` tools do local execution.
- **MCP servers cannot install skills.** Skill/command distribution is the job of
  **Claude Code plugins**, not MCP.
- **`/mcp` does not *add* servers** — adding is `claude mcp add --transport http
  <name> <url>` (CLI) or a committed `.mcp.json`. `/mcp` is in-session status/auth.

**The real mechanism is PLUGINS.** A plugin bundles skills, agents, hooks, *and*
MCP servers, and installs via a marketplace:
`/plugin marketplace add philosaether/philset` → `/plugin install philset`.
This is the designed path for exactly what philset is.

**Smallest plausible *grounded* onboarding flow:**
1. Install Claude Code (VS Code optional).
2. `/plugin marketplace add philosaether/philset` then `/plugin install philset`
   (or clone a repo with a committed `.mcp.json` + plugin ref).
3. Open a directory, type `/hello` — Claude scaffolds `.meta/` locally via its
   own tools.
   - Let's do this, then
   - After cutting 0.3, before rewriting the philbas.com copy

→ **~2 commands + `/hello`**, zero manual file editing, no `npm`/`init`/dir-dance.
A big cut from today's 5–6 steps, and it degrades to "just works offline" once
installed. **Not** literally "`/mcp philbas.com` and done," but close in spirit.

**Surface 4 (updates) IS feasible** via MCP **resources** (pull model): `/hello`
queries a `mcp.philbas.com` resource at session start → `{latest_version,
migration_needed, notices:[...]}`. Pull-at-session-start, not real-time push (an
MCP "channels" push capability exists but is overkill here). This is the *right*
job for the MCP — the enhancement layer, not the installer.
- Agreed

## The cross-cutting tension (surface prominently in the design)

philset's identity is **offline / "no dependencies beyond Node builtins"**
(CLAUDE.md). Surfaces 1 and 4 add an external dependency. **The
progressive-disclosure framing resolves this cleanly:**

> **The plugin is the floor; the MCP is the top of the ladder.**
> Plugin install bundles everything and works fully offline. The
> `mcp.philbas.com` connection is an *optional enhancement* — updates, news,
> maybe richer onboarding — that a user opts into. philset never *requires* the
> network; it's *better* with it. That IS progressive disclosure applied to
> philset's own architecture.

This keeps the offline story intact while getting the easy install + update
channel. It's the load-bearing decision the `/draft` should open with.
- Agreed


## Capacity Estimate — the updates endpoint (surface 4)

Every `/hello` (with the check enabled) hits `mcp.philbas.com/updates`.
- Pessimistic near-term: 1,000 users × 5 sessions/day = **5k req/day ≈ 0.06 QPS**.
- Optimistic growth: 100k users × 10 sessions/day = **1M req/day ≈ 12 QPS**.
- Payload: a small JSON manifest, <2 KB. 1M/day × 2 KB ≈ 2 GB/day egress.

**Verdict: trivially cheap.** A Cloudflare Worker (Phil's stack) serving a cached
JSON manifest handles 12 QPS at ~$0. The endpoint is *not* a scaling concern —
which de-risks surface 4's infra worry. The real cost of #4 is **trust/verification**
(below), not compute.

## Trust model (surface 4 — the real risk, not capacity)

An endpoint that mutates agent behavior ("hotfix `/draft` with this language")
is a remote-code-influence channel. Design needs: **opt-in** (a signpost flag),
**user-visible** (surfaced in the `/hello` summary, never silently applied),
**bounded** (news/notices + version signals, NOT arbitrary instruction injection
into skills without user consent), and ideally **signed/provenanced**. "We won't
get sued" cuts both ways — an un-trustworthy update channel is its own liability.

## External Input

- Phil's framing (this session): four surfaces, "design it all at once, stage into
  several roadmap phases." Motivating persona: a *writer* for whom the current flow
  is "meaningless hoop-jumping."
- Related roadmap items to braid: **`/hey`** (Tier 2 — the lightweight floor,
  directly surface 2), **signpost per-skill config** (Tier 4 — `hello.check` is an
  instance of it; just shipped its first instance via `review.dimensions`),
  **connector-health check at `/hello`** (Tier 2 — pairs with surface 2's gating),
  **calendar flag** (the existing opt-in precedent for surface 2).

## Recommended Next Steps (directional — the design stages these)

The four surfaces are separable and ship independently. Suggested staging:

1. **Phase 0 — the floor (in/near v0.3):** ship **`/hey`** (surface 2's lightest
   floor) + generalize the opt-in idea to a `hello.check: [...]` signpost list so
   `/hello` stops assuming calendar. Cheap, no external dep, immediately useful.
   *Reuses the just-shipped per-skill-config convention.*
   - And we can add the mcp check to the array for easy opt-out
2. **Phase 1 — per-skill suggestion layer (surface 3):** a shared "disclosure"
   convention skills apply — deliberate, encouraged, cross-domain nudges. No
   external dep. Pure skill-prose work, philset-native.
3. **Phase 2 — plugin distribution (surface 1):** repackage philset as a Claude
   Code **plugin** + marketplace. This is the real onboarding win and supersedes
   the npm/init/symlink install story (ties into the deploy-vs-symlink +
   work-laptop-release threads). Bigger; its own design + build.
4. **Phase 3 — MCP enhancement layer (surfaces 1-rich + 4):** stand up
   `mcp.philbas.com` as the *optional* top-of-ladder: onboarding assist + the
   updates/news channel (pull-at-`/hello`, opt-in, user-visible, trust-modeled).
   Depends on Phase 2's plugin existing. The offline floor never depends on it.

**Framing for the `/draft`:** open with the plugin-is-floor / MCP-is-ladder
decision (it resolves the offline tension and orders the phases), then design each
surface. Expect the doc to `/defer` Phases 2–3 into roadmap stages while fully
specifying Phase 0–1 (the near-term, no-external-dep wins).
