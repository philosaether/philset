---
name: hey
description: Lightweight session start — the sparse floor below /hello. Does a minimal tree walk (signpost-flag inheritance + root WORKFLOW.md) then reads the local .meta/ — but no full state read and no network. Auto-escalates to /hello for domain/neighborhood/full-state context; never runs MCP/API/calendar or hello.check. Use when you want to get moving fast without the full orientation.
---

# Hey

The user typed `/hey` — a light, fast session start. This is the **sparse floor**
below `/hello` (the verbose one). Load just enough local context to get moving;
pull more only if the work actually needs it.

## Step 0: Orientation

Skip if you've already seen it today. `/hey` is a philset session start — the
same rules as `/hello` apply, floor or not:

- philset replaces `/plan` and `/ultraplan` with the assess→draft→ship flow.
  Don't invoke them unless signpost `allow-plan: true`, or the user explicitly
  asks.
- Invoke `/retro` yourself on collaboration friction; `/defer` yourself on
  deferral intent — don't wait to be asked.
- Two orthogonal cadences: the **workday** (`/hey`|`/hello` open, `/ttyl` close)
  and the **feature branch** (`/draft` open, `/review` close). Session state lives
  in the `.meta/` directory — your first stop for reading or writing context.

## Step 1: Minimal walk + local context

**First, a minimal tree walk (config pass).** Walk up from cwd to the root
(a `signpost.yml` with `root: true`, or `~`). At each level, `signpost.yml` and
`WORKFLOW.md` live *inside* that level's `.meta/` directory — not at the
directory root. Do exactly two things:

- **Merge signpost flags**, child overriding parent — full inheritance
  (`architecture`, `calendar`, `hello.check`, `private-meta`, `allow-plan`, …).
  Treat this as a *config pass*: collect **all** flags into session config so the
  rest of the session's skills are aware of them, even though `/hey` itself acts
  on none. (Config lives above cwd often enough — e.g. a project with no local
  `signpost.yml` under a `root: true` parent — that skipping the walk leaves the
  session silently unconfigured.)
- **Read the root `.meta/WORKFLOW.md`** (user context) — loads working preferences and
  guardrails, e.g. *explicit consent required before merging to `main`*.

**Relink check (cwd only, when `central-meta` is set):** if cwd's `.meta` is a
dangling symlink — or absent while the central repo holds state at
`<central-meta>/<cwd relative to $HOME>/.meta` (the re-clone case) — offer to
run `philset adopt`. A broken link means the session runs context-blind, which
defeats the floor's own purpose; the check is pure local fs, no network. Quiet
when healthy; unlike `/hello`, do NOT check other walk levels.

**Then, the local `.meta/`** in cwd, if it exists:
- `in-progress.md` — what's active
- `decisions.md` — recent tail (last few entries), not the whole log
- Current git branch + `git status` (uncommitted work, branch name)
- If on a `riff/` branch with a matching `tracks/` file, read it (you're resuming
  a riff)

**Do NOT** (these stay `/hello`-only, reachable via escalation): read intermediate
**domain** context (`conventions.md`, domain `roadmap.md`/`inbox`), scan
sibling/neighborhood dirs, persist quick-links to `breadcrumbs.log`, offer
scaffolding, check `logical-architecture.md`, or surface aged notes.

**Never touch the network:** run **no** MCP/API/calendar reads and **no**
`hello.check` entries. `/hey` *collects* the `hello.check` flag (config pass) but
runs none of them and says nothing about them — no "calendar enabled" nudge. If
you typed `/hey`, you've opted out of the calendar for this session; that's the
deal, not a bug.

If there's no `.meta/` in cwd, say so in one line and offer `/hello` (which can
scaffold) — don't scaffold from `/hey`. (The minimal walk still runs — config and
user context don't depend on a local `.meta/`.)

## Step 2: One-line summary

Give a *terse* readout: branch, what's in progress, any uncommitted work. A
sentence or two. No roadmap scan, no calendar, no quick-links. Then wait for
direction.

## Step 3: Escalation gate

`/hey` is a floor, not a ceiling. Signpost inheritance and root user context are
now **baseline** (Step 1) — so escalation is about *breadth beyond the minimal
walk*, not config or user context. **Auto-escalate** to the relevant `/hello`
step(s) — without asking — the moment the session needs more than the minimal walk
+ local directory hold:
- feature work that spans the tree (**domain** context, `logical-architecture.md`)
- a cross-project reference (another project's `.meta/`, quick-links)
- a design/assess/ship ask that wants full project state
- resuming something whose context isn't in cwd `.meta/`

When you auto-escalate, say so in one line ("pulling full context — this spans the
tree") and run the specific `/hello` step(s) you need. You don't have to run all of
`/hello`; pull what the moment requires.

**`hello.check` entries are exempt from auto-escalation — all of them.** Every
`hello.check` entry (`calendar`, `connectors`, `updates`, …) is an external/MCP/
network read, so a `/hey` session **never runs any of them**, even after
escalating for local context: an auto-escalated `/hello` step **skips Step 6.5
entirely**. Auto-pull *local* context freely (tree walk, architecture,
cross-project `.meta/`); never auto-reach the network. If an optional check is
genuinely wanted, the user runs `/hello`.
