---
Status: accepted
Date: 2026-05-23
Accepted: 2026-05-23
Implemented: 2026-05-23 (feature/riff-defer-skills)
Divergences: none
Deferred: developer documentation (to roadmap), extract hardcoded meta-README from /hello (to roadmap)
Assessment: ../assessments/deferral-patterns.md
---

# /defer Skill — Desired State

Formalize deferral as a philset skill. `/defer` captures future work with
automatic provenance and routes it to the right destination. Two canonical
`.meta/` files get promoted: `roadmap.md` (local backlog) and
`inbox/to-do.md` (inbound items from external sessions or manual capture).

---

## The Two Operations

`/defer` handles one thing: **backlog-building** — "this matters, not now."

It does *not* handle parking active work with a branch. That's workstream
suspension (future `/suspend` skill, `in-progress.md` Parked section).
The distinction:

| | /defer | /suspend (future) |
|---|---|---|
| What | An idea, a task, a research question | Active work with commits |
| State | Has no branch yet | Has a branch, partially built |
| Destination | `roadmap.md` | `in-progress.md` Parked |
| Tense | Future | Present (paused) |

## Invocation

Natural language, not rigid syntax. The skill should recognize these
patterns in conversation:

- `defer X` — local, no resumption condition
- `defer X until Y` / `defer X for Y` — local with trigger/blocker
- `defer X to {project}` — cross-project routing
- `defer X to {project} by {date}` — cross-project with deadline

The user may also say things like "add that to the roadmap," "put that
on PE's backlog," "we'll deal with that later" — these are all deferral.
Claude should recognize the intent and invoke the skill's logic
automatically (agent-invoked, like `/retro`). `/hello` introduces this
behavior so the agent knows to watch for deferral intent.

## What Gets Captured

Every deferred item records:

1. **What** — the item, in the user's words (lightly edited for clarity)
2. **Provenance** — automatic:
   - Source project (cwd project name)
   - Branch (current git branch)
   - Date
3. **Resumption condition** — one of:
   - **Blocker**: what must happen first ("don't build until X")
   - **Deadline**: a date by which it must happen
   - **None**: no signal, pulled from the heap by salience

What /defer does NOT capture (and should not ask for):
- Category — the user organizes roadmap.md themselves
- Priority — roadmap ordering handles this
- Assignee — single-developer flow for now

## Destination Resolution

The core invariant: **external writes go through the inbox; only local
context edits the roadmap.** The inbox is the staging area; the roadmap
is the curated state. This mirrors the pull-request model — you don't
commit directly to a repo you don't have full context on.

### Local deferral (default)

Append to `roadmap.md` in the current project's `.meta/`. You have full
project context, so the item can go straight to the curated backlog.
If `roadmap.md` doesn't exist, create it with the standard header.

### Cross-project deferral

When the user names a destination project:

1. Walk the signpost tree to find the target project directory
2. Append to `{project}/.meta/inbox/to-do.md` (create if needed)
3. The item carries provenance so the receiving session knows where it
   came from and can process it into roadmap entries with full context
4. If the target project is not found in the tree: ask. Don't guess paths.

Cross-project items always land in `inbox/to-do.md`, never directly in
`roadmap.md`. Reason: you don't have full project context from an
external session. A single deferred item ("student merch commissions")
might need to be broken into multiple roadmap entries, recategorized,
or scoped differently once you're sitting in that project with its full
state loaded. The inbox is where that triage happens.

### Ambiguity

If the destination is unclear (the user describes work that doesn't
obviously belong to the current project, and doesn't name a target):
ask. One question: "Which project should own this?"

## Roadmap Item Format

```markdown
- **Item name** — Description.
  Deferred from: [project]/[branch] ([date]).
  Blocker: [condition] | Due: [date] | (omit line if none)
```

### Local examples (→ roadmap.md)

```markdown
- **Theming engine v2** — Runtime theme switching as a first-class
  library feature, not demo-only code.
  Deferred from: chipper/riff/demo-task-sentence (2026-05-21).
  Blocker: second consumer theme or npm publish prep
```

### Cross-project examples (→ inbox/to-do.md)

These land in the target project's inbox for triage during a local session:

```markdown
- **Grant application** — Apply for the grant Ronique identified.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
  Due: 2026-06-15

- **Student merch commissions** — Research commission structure and
  financial tracking for students who design PE merch.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
```

Items without a blocker or deadline omit the third line entirely — they're
pulled from the heap by salience during `/hello`.

## Two New Canonical `.meta/` Files

### roadmap.md

`roadmap.md` joins `decisions.md` and `in-progress.md` as a core state
file. This means:

- `philset begin` scaffolds it (empty, with header)
- `/hello` reads it and surfaces relevant items in the status summary
- `/assess` checks it ("is this already on the roadmap? are there
  adjacent roadmap items?")
- `/ttyl` does NOT rewrite it (unlike `in-progress.md`). The roadmap is
  append-forward; items are removed when they graduate to active work,
  not during session cleanup.

- `/review ` marks a roadmap item complete and archives it (if relevant)

### inbox/to-do.md

`inbox/to-do.md` becomes the canonical destination for cross-project
deferral and manual capture. This means:

- `philset begin` scaffolds it (empty, with header)
- `/hello` reads it and surfaces items needing triage ("3 inbox items,
  1 from chipper session on 5/21")
- Items arriving via `/defer` carry provenance; items added by hand don't
  — both are valid
- Triage is manual: during a local session, the user processes inbox
  items into roadmap entries, designs, or dismisses them

### Relationship to in-progress.md

Clean split on tense:

| File | Tense | Contains |
|---|---|---|
| `in-progress.md` | Present | Active work, Parked (suspended with branch) |
| `roadmap.md` | Future | Deferred work, ideas, research questions |

**Migration:** `in-progress.md` loses its "To Explore" section. Those
items move to `roadmap.md`. "Parked" stays in `in-progress.md` — it
represents present-tense suspended work, not future backlog.

### Roadmap header

```markdown
# Roadmap

Future work. Items land here via `/defer` or by hand. Each item says
what it is and what's blocking it (if anything). Organized by the user
into categories that make sense for the project.

---
```

The body is user-organized. `/defer` appends to the end; the user groups
items into categories over time. No prescribed category structure — a
library (chipper) will have different categories than a nonprofit (PE)
or a personal project (meta).

## Decisions.md Logging

Every deferral is a decision. `/defer` appends a one-liner:

```
2026-05-23: Deferred: grant application (to PE, due 2026-06-15).
```

This happens automatically. The user doesn't need to think about it.

## Skill Interactions

| Skill | Change needed |
|---|---|
| `/hello` | Read `roadmap.md` + `inbox/to-do.md`, surface counts + approaching deadlines (14-day window). Introduce agent-invoked `/defer` (like agent-invoked `/retro`) — when Claude recognizes deferral intent in conversation, invoke the skill's logic. |
| `/assess` | Check `roadmap.md` for related items when assessing a topic |
| `/draft` | No change — `/defer` is the escape hatch *from* draft when scope exceeds |
| `/ship` | No change |
| `/review` | Check `roadmap.md` to see if any items have been completed, and archive if so |
| `/riff` | `/defer` is the primary scope-escalation escape hatch |
| `/ttyl` | No change to roadmap.md (append-forward, not session-rewritten) |

## Domain-Level Surfacing

When `/hello` walks the signpost tree, it reads `roadmap.md` and
`inbox/to-do.md` at each level where `.meta/` exists. Domain-level items
surface during `/hello` on any project under that domain:

> "The html domain has 2 roadmap items (1 due by 2026-06-05) and 1 inbox
> item from philset session on 5/23."

This handles the ENYC case: the item lands in `html/.meta/inbox/to-do.md`
(since it's a cross-project deferral) and surfaces when Phil starts a
session on any html project. During that session, he triages it into the
appropriate project's roadmap — or scaffolds the new ENYC project first.

## Tradeoffs

### Roadmap.md vs. extending in-progress.md

Could have added a "Backlog" section to in-progress.md instead of a
separate file. Rejected because:
- in-progress.md is rewritten by `/ttyl` every session — mixing
  append-forward roadmap items with session-rewritten status is fragile
- The files serve different audiences: in-progress.md answers "what am I
  doing right now?" while roadmap.md answers "what should I do next?"
- Separate files can grow independently. Chipper's roadmap is 110 lines;
  mixing that into in-progress.md would bury the active-work signal.

Would revisit if: projects routinely have <5 roadmap items and the
overhead of a separate file feels like waste.

### Cross-project → inbox vs. cross-project → roadmap

Could route cross-project deferrals directly to the target's roadmap.md.
Rejected because:
- The `.meta/` directory should shadow codebase state — directly editing
  a state file without full project context is risky
- A single deferred item may need to be broken into multiple roadmap
  entries once you have local context (e.g., "student merch commissions"
  → research + legal + tracking)
- The inbox is the staging area; the roadmap is the curated state. Same
  pattern as PRs vs. direct commits.

Would revisit if: the triage step consistently feels like unnecessary
ceremony for simple, unambiguous items.

### Rigid syntax vs. natural language invocation

Could require `/defer "item" --to project --blocker "condition"`. Rejected
because:
- Phil's natural phrasing is "defer that to PE" or "we'll deal with that
  after the move" — forcing flag syntax on a conversational flow is
  friction
- Claude can parse intent from natural language; the skill.md describes
  the patterns to recognize
- Flags would need escaping, quoting, and error handling — complexity
  for no benefit in a conversational interface

Would revisit if: parsing ambiguity causes frequent mis-routing.

### Provenance on manually-added items

Could have `/review` or `/hello` flag roadmap items missing provenance
("these items need to be fleshed out"). Rejected because:
- Manual additions are a valid pattern Phil wants to preserve
- Forcing provenance on hand-written items adds friction
- The two tiers (machine-written with provenance, human-written without)
  are fine — provenance is metadata for recall, not a requirement

Would revisit if: stale items with no context become a recurring problem
during `/hello` triage.

### Category as required metadata

Could require a category on each deferred item. Rejected because:
- Category is an organizational concern, not a capture concern
- Forcing categorization at deferral time slows down the "get it out of
  my head" moment
- The user reorganizes the roadmap file over time; let them

Would revisit if: roadmaps consistently grow to 50+ items and become
hard to scan without structure.

## Open Questions

1. **Graduation convention.** When a roadmap item becomes active work,
   where does it go? Options:
   - **"Completed" section** at the bottom of roadmap.md (keeps the arc
     visible in one file)
   - **archive/rearview.md** (keeps roadmap.md lean, arc visible in
     archive)

   Decision: archive. `/review` handles graduation — checks roadmap.md
   for completed items and moves them to `archive/rearview.md`.

## Out of Scope

- **Task management integration** (Praxis tasks, calendar entries) —
  deferred. /defer captures the item; task management acts on it later.
- **/suspend skill** — separate skill, separate design. /defer builds the
  backlog; /suspend parks active work.
- **/route skill** — /defer covers the routing use case. No separate
  /route skill planned.
- **Signpost-based rules** (e.g., "auto-create Praxis task for items
  with deadlines") — future signpost.yml extension, not part of v1.
- **Multi-developer roadmap conventions** — single-developer flow for now.
