# Assessment: philset ↔ Praxis Relationship
Date: 2026-07-01
Branch: main

Scope: what philset and Praxis each own today, the integration surface (with
attention to the CRM/calendar/task need surfaced in the 2026-07-01 career
braindump), and options for a cross-machine bridge between the work-laptop
philset and the personal-machine philset. Feeds a later `/draft` (and possibly a
dedicated CRM/calendar assessment). Not a plan.

---

## Current State

### What philset owns
philset is the **context / authoring substrate**: per-project, git-native,
agent-driven document work. State lives in `.meta/` trees walked via
`signpost.yml` (root at `~/Development/.meta/`). It owns the *iteration loops*
(the altitude gradient: mechanical → riff → amend → draft → study) and the
durable artifacts they produce — `decisions.md`, `roadmap.md`, `designs/`,
`assessments/`, `study/`, `inbox/`. Distribution is an npm package
(`bin/philset.js`, v0.2.2) installed to `~/.claude/skills/`. **Sync today = git**
(per-repo), and state is single-user by assumption (chunk 2 unbuilt).

### What Praxis owns
Praxis (`~/Development/praxis`) is the **prioritization / task engine**:
cue-based, cross-project, cloud-deployed (Railway, `praxis.philbas.com`, alpha
~5 users, SQLite). It models a **priority forest** per user
(Value / Goal / Practice / Initiative / Org) + **Tasks** + a YAML **Rules
engine** + **Sharing** (friend requests, permission levels, adoption). Three
interfaces share one `praxis_core`: a **CLI**, a **Web UI** (FastAPI + HTMX), and
— load-bearing for this assessment — a **JSON Agent API** (`/agent/priorities`,
`/agent/tasks`, `/agent/graph`, `/agent/rules`; bearer-token auth). It is
**API-native and already reachable by Claude Code.**

### The touchpoints that already exist (mostly planned, not built)
Praxis's own roadmap already anticipates the relationship:
- **philset hook → Praxis** — Claude Code conversations that produce task
  descriptions auto-create Praxis tasks via the agent API (deriver: embed →
  kNN-retrieve similar past tasks for priority/tag grounding → upsert).
- **praxis-daemon** — an MCP server + HTTP client so Claude Code speaks to the
  agent API natively. (There is a separate `~/Development/philset-mcp` dir —
  worth checking whether it's the same effort.)
- **roadmap.md ↔ Praxis parity** — pull `roadmap.md` items into Praxis as
  initiatives (agent-managed queue).
- **mini-honcho topology** (Praxis `feature/mini-honcho-topology`, in progress) —
  a local-K8s async deriver prototype explicitly framed as groundwork for later
  philset integration.

So the bridge is **half-designed on the Praxis side and absent on the philset
side.** philset's own roadmap has only the generic "PM integration via signpost
flags" line (now converged into the Tier-2 Praxis item).

---

## What's Working
- Both systems are real and dogfooded: philset drives daily doc work across many
  repos; Praxis is deployed with a working priority/task/rules model and a stable
  agent API.
- The **agent API is the right primitive** for a bridge — JSON, token-auth,
  already consumed by Claude Code patterns. No new protocol needed.
- philset's **inbox-as-staging** is already concurrency-safe (the dev-state
  assessment's point #4), which is the correct shape for cross-source traffic.
- The conceptual division is clean where it's clean: philset = *author/decide in
  context*; Praxis = *surface what to do next across contexts*.

## Gaps
1. **CRM + calendar is owned by neither system.** This is the sharpest finding.
   Praxis has **no person/contact entity and no event/calendar model** (calendar
   awareness is a *post-β.public deferred* item); philset has no such concept at
   all. The braindump's concrete needs — "who from my CRM will be at tonight's
   mixer," "what are next week's meetings about" — fall through the cracks of
   both. This is **net-new surface**, not an integration of existing parts.
   (Note: Google Calendar + Gmail MCP tools are available in this environment —
   an external-integration path exists without building calendar from scratch.)
2. **Duplicated backlog.** "What to work on next" lives in *both* philset
   `roadmap.md` and Praxis initiatives/`beta-roadmap`. Phil maintains both by
   hand. The planned roadmap↔initiatives parity is the intended fix but isn't
   built — today it's drift.
3. **No live bridge.** Every philset↔Praxis touchpoint above is planned, not
   shipped. There is currently no automated flow in either direction.
4. **No cross-machine story.** The work-laptop ↔ personal-machine question has no
   answer today. git syncs *per-repo* durable state; nothing syncs the
   *cross-project* "what to do / who to see / when" layer. Praxis (cloud, shared,
   API) is the obvious hub — but see #5–6.
5. **Bridge depends on unfinished foundations on both sides.** philset's
   multi-user state model (chunk 2) isn't built, and the `private-meta` flag is
   still a Tier-1 stopgap. Praxis is mid-migration (SQLite → Postgres → EKS) and
   its Terraform networking is **parked as of 2026-06-21** (for the Plastic Labs
   interview), single-tenant-ish in alpha. Leaning on Praxis as the shared
   cross-machine backend means depending on infra that isn't hardened yet.
6. **`philset-mcp` vs. `praxis-daemon` may be redundant or divergent** — two
   MCP-shaped efforts; unclear if they're the same bridge. Needs reconciliation
   before either is invested in further.

## Capacity Estimate (napkin — informs bridge architecture, not urgent)
- **Cross-machine sync cadence:** Phil, 2 machines, realistically 10s–100s of
  task/roadmap mutations per *day*. This is tiny — it argues for **batched /
  pull-on-`/hello`** sync, *not* an always-on daemon. Praxis's own plan already
  says "batched on Cloudflare Workers until volume justifies always-on infra" —
  consistent.
- **Praxis API volume for a bridge:** a `/hello` that pulls cues + a `/ttyl`/
  `/defer` that pushes = a handful of agent-API calls per session. Negligible
  load on a single Railway process.
- **CRM/calendar data size:** contacts in the 10²–10³ range, calendar events
  similar per month. Trivially small; fits SQLite or an external MCP source. The
  question is *modeling and freshness*, not scale.
- **Implication:** the bridge is a *correctness/ownership* problem, not a
  throughput one. Don't over-engineer the transport.

## External Input
- **2026-07-01 career braindump** (the trigger): solo-dev era ending; the
  "bounce around `Development/`, think out loud, route conclusions to project
  dirs" workflow is buckling under meeting/third-party-org load; explicit
  intuition that **Praxis is the bridge** between work and personal philset, and
  that this implies **hardening + portability of the tree-based context
  structure** and a philosophy question about philset/praxis's nature.
- **philset dev-state assessment** (2026-06-25): philset is "a tree with traffic
  between nodes"; state has two lifetimes (branch-volatile vs. durable); inbox is
  the concurrency-safe primitive; chunk 2 is the structural multi-user
  prerequisite.
- **Praxis roadmap**: philset hook, praxis-daemon, roadmap↔initiatives parity,
  mini-honcho — the Praxis-side half of the bridge.

## Recommended Next Steps (directional — the plan comes later)
1. **Settle the conceptual division first — this *is* the philosophy question.**
   Before any transport, name the ownership boundary crisply: philset = author /
   decide / retain *in project context* (git-native, per-repo, durable docs);
   Praxis = prioritize / schedule / surface *across contexts* (cloud, API,
   cross-project cue engine). The load-bearing test case is the **duplicated
   backlog**: decide whether `roadmap.md` is the source of truth that *projects
   into* Praxis, or Praxis is the source that *materializes into* `roadmap.md`.
   Everything else follows from that call.
2. **Treat CRM + calendar as its own scoping question, likely a separate
   `/assess`.** It's net-new to both systems and has an external-integration path
   (Google Calendar/Gmail MCP already available) vs. a build-into-Praxis path
   (add Person/Event entities to the existing model + API). Don't fold it into
   the bridge design blindly — it may be a Praxis feature, not a philset one.
3. **Reconcile `philset-mcp` vs. `praxis-daemon`** before building bridge
   plumbing — one MCP surface, not two.
4. **Sequence the bridge behind its foundations.** The cross-machine bridge
   leans on (a) philset chunk 2 / `private-meta` (so `.meta/` behaves in shared/
   multi-context settings) and (b) Praxis's Postgres/multi-tenant migration
   (currently parked). Near-term, a *read-only* pull (e.g. `/hello` surfaces
   Praxis cues via the agent API) is a low-risk first slice that needs neither.
5. **Then `/draft` the bridge** — a batched, pull-oriented sync (per the capacity
   read) using the Praxis agent API, with philset skills gaining Praxis-awareness
   (`/defer` can route to a Praxis initiative; `/hello` can surface cues). Not an
   always-on daemon until volume justifies it.
