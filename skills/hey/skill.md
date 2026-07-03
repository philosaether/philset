---
name: hey
description: Lightweight session start — the sparse floor below /hello. Loads light, local context only (cwd .meta/, current branch), no tree walk, no MCP/API reads. Auto-escalates to /hello when the session needs more than local context; never touches the network. Use when you want to get moving fast without the full orientation.
---

# Hey

The user typed `/hey` — a light, fast session start. This is the **sparse floor**
below `/hello` (the verbose one). Load just enough local context to get moving;
pull more only if the work actually needs it.

## Step 1: Load local context only

Read **only the current directory's** `.meta/`, if it exists:
- `in-progress.md` — what's active
- `decisions.md` — recent tail (last few entries), not the whole log
- Current git branch + `git status` (uncommitted work, branch name)
- If on a `riff/` branch with a matching `tracks/` file, read it (you're resuming
  a riff)

**Do NOT:** walk the signpost tree, read parent/root context, read `WORKFLOW.md`,
run any MCP/API/calendar reads, or run the optional `hello.check` entries. `/hey`
is deliberately local and offline.

If there's no `.meta/` in cwd, say so in one line and offer `/hello` (which can
scaffold) — don't scaffold from `/hey`.

## Step 2: One-line summary

Give a *terse* readout: branch, what's in progress, any uncommitted work. A
sentence or two. No roadmap scan, no calendar, no quick-links. Then wait for
direction.

## Step 3: Escalation gate

`/hey` is a floor, not a ceiling. **Auto-escalate** to the relevant `/hello`
step(s) — without asking — the moment the session needs more than the local
directory holds:
- feature work that spans the tree (parent/domain context, `logical-architecture.md`)
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
