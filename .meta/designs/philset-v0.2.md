---
Status: accepted
Date: 2026-04-29
Accepted: 2026-04-29
Assessment: ../assessments/development-hierarchy.md
Supersedes: skill-onboarding.md (distribution model; skill generalizations already shipped)
---

# philset v0.2 — Desired State

philset becomes a real tool: an npm package that installs skills globally,
provides a CLI for project scaffolding, and teaches `/hello` to discover
user + domain + project context automatically — no hardcoded paths, no
manual CLAUDE.md references.

---

## 1. The Context Discovery Problem

**Design constraint** (from assessment): A developer should be able to run
`/hello` in any directory and have the session instantly oriented to both
their project context and their personal user context. Another developer
could do the same on their machine, with a cloned copy of the same repo,
and load shared project context but their own user context.

Today this fails because:
- User context (WORKFLOW.md) only loads when CLAUDE.md explicitly references it
- Domain context (html/ conventions) doesn't exist
- There's no mechanism for context to flow from parent to child directories

### Two context channels

| Channel | Owned by | Committed to git | Discovery |
|---------|----------|-----------------|-----------|
| **Project context** | The team | Yes (in repo `.meta/`) | Already works — `/hello` reads `.meta/` in cwd |
| **User context** | The individual | No (lives outside repos) | Broken — needs a discovery mechanism |

These are fundamentally different. Project context travels with the repo.
User context travels with the person. They meet at session start.

**Multi-developer merge considerations:** When multiple developers maintain
`decisions.md` and `in-progress.md` on separate branches, `/review`
handles reconciliation pre-merge. Entries interleave by timestamp. If two
branches introduce contradictory decisions, `/review` flags the conflict
for human resolution.

### Separation of concerns

`.meta/` is philset's space. `.claude/` is Claude Code's space. Overlap
is kept minimal.

A typical project directory:
```
my-project/
├── .meta/              # philset: project state, tracked in git
│   ├── signpost.yml
│   ├── decisions.md
│   ├── logical-architecture.md
│   └── ...
├── .claude/            # Claude Code: settings, memory, gitignored
│   └── settings.json
├── CLAUDE.md           # Claude Code reads this at session start
└── src/
```

Claude Code updates CLAUDE.md based on its logic. philset skills update
`.meta/` based on theirs. WORKFLOW.md lives in the philset tree (`.meta/`
at the root level), not in `~/.claude/`.

Assumption: `.claude/` is gitignored, `.meta/` is not. Not enforced.

### The signpost: `.meta/signpost.yml`

Every `.meta/` directory can contain a `signpost.yml` with philset
configuration. This is how the tree walk knows where it is.

```yaml
# ~/Development/.meta/signpost.yml (root)
root: true
```

```yaml
# ~/Development/html/.meta/signpost.yml (domain)
# No special flags needed — existence of .meta/ is enough
# Optional: name, ignore
```

```yaml
# ~/Development/html/philbas.com/.meta/signpost.yml (project)
# Typically absent — defaults are fine for most projects
```

`root: true` is the stop condition for the tree walk. If you reach `~`
without finding a root signpost, stop anyway.

A user can set `root: true` on any `.meta/signpost.yml` to create an
isolated context subtree (e.g., a client engagement that shouldn't inherit
parent conventions).

**signpost.yml schema (v0.2):** All fields optional. File itself optional.
Unset fields use defaults.

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `root` | bool | `false` | Stop condition for tree walk |
| `name` | string | dirname | Display name in status readouts |
| `ignore` | string[] | `[]` | Directories to skip during sibling listing |
| `architecture` | bool | `true` | Whether `/hello` maintains `logical-architecture.md` for this directory. Inherited: a parent's `false` applies to children unless a child explicitly sets `true`. |

The `architecture` flag defaults to `true` (unset = on). Setting it to
`false` opts out — `/hello` won't offer to create or maintain
`logical-architecture.md` for this directory or its children. A child can
override back to `true`. The flag is written to `signpost.yml` when the
user declines the initial offer, so they're never asked again.

Signpost is designed for extension. Future flags (e.g., PM integration
in v0.3) follow the same pattern: optional, inherited, overridable.

### The tree walk

`/hello` discovers context by walking up from cwd:

1. Start at cwd
2. Walk up one directory at a time
3. At each level, if `.meta/` exists, collect it (and read `signpost.yml`)
4. Stop when you find `signpost.yml` with `root: true`, or reach `~`
5. Merge inherited signpost flags (child overrides parent)
6. Present context outermost-first (root → domain → project)

At each level with a `.meta/`, also note sibling directories. This gives
the session awareness of the neighborhood — you can reference eidea from
philbas.com without confusion because the walk through `html/` revealed
both as siblings.

**User context** lives at the tree root. `~/Development/.meta/WORKFLOW.md`
is Phil's user context file, committed to its own git repo. Other users
have their own root `.meta/` wherever their dev directory is.

**Fallback**: If `/hello` walks all the way to `~` without finding a root
signpost, fall back to `~/.claude/WORKFLOW.md` (Claude Code's user config
dir). This works — it's where the file lives today. But the session should
note the absence for `/retro` to flag later (see: agent notes below).

### Agent notes: ephemeral cross-skill communication

Skills sometimes need to communicate across a session: `/hello` notices
something that `/retro` should address. We can't rely on the context
window surviving that long.

**Solution:** `breadcrumbs.log` in the project `.meta/` directory gains
a `## Notes` section at the top for cross-skill observations. Skills
append notes; `/retro` reads and removes the ones it addresses. Remaining
notes persist until consumed or cleared by `/ttyl` as stale.

Examples:
- `/hello` notes: "No philset root found — suggest `philset init`"
- `/hello` notes: "Project skills are 2 versions behind global"
- `/hello` notes: "logical-architecture.md may be stale — new directories: X, Y"
- `/review` notes: "decisions.md has a merge conflict pattern emerging"

### Agent orientation (Step 0 of `/hello`)

`/hello` begins with a preamble that orients the agent to the philset
system. This is instructions *for the agent*, not output for the user.
The user-facing summary stays clean.

```
Step 0: Philset orientation (skip if already seen today)

  This skill is part of the philset Claude Code skills library. All
  philset skills depend on the .meta/ directory for session persistence.
  This directory will be referenced repeatedly throughout the working
  session, and should be your first stop for reading or writing context.

  philset uses two cadences:
  - Developer session (workday): /hello opens, /ttyl closes. These
    persist state in decisions.md and in-progress.md.
  - Development session (feature branch): /draft opens, /review closes.
    These scope and gate feature work.
  The cadences are orthogonal — a feature may span multiple workdays,
  or multiple features may ship in one day.

  Update decisions.md during conversation as decisions are made — don't
  wait for a skill invocation.
```

### logical-architecture.md

Moves from project root to `.meta/logical-architecture.md`. This is a
philset artifact — the authoritative map of the codebase, maintained by
`/hello` and consumed by `/review` and `/assess`.

**Creation:** `/hello` offers to generate it on first run for projects
where `architecture` is not `false`. If the user declines, `/hello`
writes `architecture: false` to `signpost.yml` (creating the file if
needed) and never asks again.

**Maintenance:** When `/hello` reads an existing `logical-architecture.md`,
it does a quick consistency check against the actual directory structure.
If new top-level directories or modules have appeared since the last
update, it notes the drift in breadcrumbs `## Notes` but doesn't
auto-fix — the user or `/review` handles updates.

### What about Claude's auto-memory?

Memory fragmentation (the same insight scattered across project-specific
memory dirs) is a real problem, but it's Claude Code's problem, not
philset's. Auto-memory is managed by Claude Code's own `~/.claude/projects/`
system. philset shouldn't try to solve memory inheritance.

The philset answer to cross-session persistence is `/retro`, not
auto-memory. `/retro` generates insights and routes them to the right
place: WORKFLOW.md for user-level patterns, `.meta/` for project-level
decisions. We don't depend on Claude Code to persist workflow improvements
for us.

## 2. Two Cadences

philset skills operate on two orthogonal cadences:

**Developer session** (workday): orient → work → persist
- `/hello` → load tree context, orient to project, check state
- `/ttyl` → persist state, clear stale notes, hand off to next session

**Development session** (feature branch): scope → build → merge
- `/draft` → scope feature, check branch, create design doc
- `/ship` → accept design, begin implementation
- `/review` → pre-merge gate, reconcile state, merge readiness
- (merge to main)

These overlap without conflict:
- A feature branch may span multiple workdays. `/ttyl` captures daily
  progress in decisions.md and in-progress.md. `/review` reads that
  accumulated state when the branch is ready to merge.
- Multiple features can ship in one workday, each with its own
  `/draft` → `/ship` → `/review` → merge cycle.
- `/retro` floats — it's a calibration tool, usable mid-session or at
  either cadence boundary.

## 3. Skill Summaries

Current behavior plus v0.2 changes. This is the full skill inventory
shipped with the philset package.

### `/hello` — Session startup (developer session: open)

0. **Philset orientation** (NEW): agent-facing preamble explaining the
   `.meta/` persistence system and two-cadence model. Skipped if already
   seen today. Not shown in user-facing output.
1. **Tree walk** (NEW): Walk up from cwd collecting `.meta/` directories.
   Stop at root signpost or `~`. Read WORKFLOW.md from root (user context),
   context files from intermediate dirs (domain context). Note siblings
   at each level. Merge inherited signpost flags. Fallback to
   `~/.claude/WORKFLOW.md` if no root found; note the gap in breadcrumbs.
2. **Read CLAUDE.md** in cwd (if it exists)
3. **Read project state**: if `.meta/` exists, read what's in it (decisions,
   in-progress, designs/index, inbox — whatever exists, skip what doesn't).
   If `.meta/` doesn't exist, offer to scaffold it. No tier labels — just
   read what's there.
4. **Offer logical-architecture.md** (NEW): if `architecture` flag is not
   `false` and no `.meta/logical-architecture.md` exists, offer to generate
   one. If declined, write `architecture: false` to signpost.yml.
5. **Orient**: `ls`, git status, branch, uncommitted work. Read
   `logical-architecture.md` if it exists. Quick consistency check for
   directory drift — note in breadcrumbs if stale.
6. **Summarize**: project purpose, concrete `.meta/` state (e.g., "14
   decisions, 2 active designs"), in-progress items, inbox, git state,
   tree context loaded, available skills. Warn if project skills are
   behind global (NEW).

### `/assess` — Structured assessment

1. **Scope**: identify what's being assessed from the user's topic.
   Ask if ambiguous.
2. **Explore**: check prior assessments in archive, read relevant source
   files, git log, design docs, decisions, in-progress, inbox. Go deep.
3. **Write**: create `assessments/<topic-slug>.md` with Current State,
   What's Working, Gaps, External Input, Recommended Next Steps.
4. **Present**: show the user, expect adjustments before moving to design.

### `/draft` — Working design document (development session: open)

1. **Branch check** (NEW): verify current branch. If on main, offer to
   create a feature branch. If on a branch that doesn't match the topic,
   surface the mismatch ("drafting foo but on branch feature/bar —
   continue?"). Not blocking — just a nudge.
2. **Scope check**: if the request is genuinely ambiguous (not just terse),
   ask 1-2 scoping questions. Skip when constraints are provided or
   conversation has context.
3. **Gather context**: check assessments, conversation, `designs/index.md`
   for related or superseded designs.
4. **Write**: create `designs/<topic-slug>.md` with frontmatter (status,
   date, assessment link, supersedes), body sections appropriate to topic,
   Open Questions, Out of Scope.
5. **Add to index**: update `designs/index.md` with status "draft".
6. **Present**: show the user. Iterate — expect inline edits, corrections,
   scope changes. Wait for `/ship`.

### `/ship` — Bless design, begin implementation

1. **Identify the design**: from args, or most recent draft in `designs/`.
2. **Finalize header**: set status to accepted, add accepted date.
3. **Handle superseded docs**: add supersession header to old doc, move
   to `archive/designs/`, remove from index.
4. **Update state files**: update `designs/index.md`, append to
   `decisions.md`, add to `in-progress.md`.
5. **Begin implementation**: start building immediately. No confirmation.

### `/review` — Pre-merge code review (development session: close)

1. **Flush decisions.md** (NEW): ensure any decisions made during
   conversation are captured before the merge-readiness check.
2. **Scope the work**: diff against base branch. Include unstaged changes.
3. **Parallel analysis** (6 dimensions, via explore agents):
   - Efficiency: unnecessary allocations, redundant loops, simplification
   - Redundancy: duplicated logic within diff and against existing code
   - Bugs: edge cases, off-by-one, null risks, race conditions
   - Architecture consistency: match `.meta/logical-architecture.md`
     (if exists)
   - Design reconciliation: compare against accepted design doc (if exists)
   - **Merge readiness** (NEW): assess `.meta/` state file conflicts and
     whether the branch will play nice with code merged since it diverged.
     Flag contradictory decisions across branches.
4. **Present findings**: bugs (must fix), improvements (should fix),
   nits (optional). File, line, issue, proposed fix.
5. **Get approval**: wait before making changes.
6. **Fix and commit**: apply approved fixes in a separate review commit.
7. **Reconcile design doc**: add implementation notes, file deferred items,
   log divergences.
8. **Archive assessments**: move consumed assessments to archive.

### `/retro` — Session retrospective (floats)

Two modes:

**Claude-invoked (mid-session):**
- 1-2 questions referencing a concrete thing that just happened
- Never "how am I doing" — always "I did X because Y, was that right?"
- Route any reusable insight immediately

**User-invoked (end-of-session):**
1. **Gather context**: git diff, decisions.md changes, planned vs actual.
2. **Read agent notes** from `breadcrumbs.log` (NEW). Incorporate any
   flags from `/hello` or other skills.
3. **Interview**: 3 questions max, all at once. Pick from: decisions,
   friction, surprises, pace, patterns, discoveries.
4. **Output routing** — route each insight to the correct tree level (NEW):
   - User-level patterns → `{root}/.meta/WORKFLOW.md`
   - Domain conventions → `{domain}/.meta/conventions.md`
   - Project decisions → `{project}/.meta/decisions.md`
   - Workflow improvements → WORKFLOW.md or new skill proposal
   - Session-specific recall → auto-memory (Claude Code's domain)
5. **Consume notes**: remove addressed items from breadcrumbs `## Notes`.
   Leave unaddressed notes for future sessions.

### `/ttyl` — Session wind-down (developer session: close)

1. **Review session**: git log, current decisions.md and in-progress.md.
2. **Update decisions.md**: append unlogged decisions. Don't duplicate
   entries from `/ship` or other skills.
3. **Update in-progress.md**: rewrite Active/To Explore/Parked to reflect
   current reality.
4. **Clear stale breadcrumbs**: clear `breadcrumbs.log` crash-recovery
   content. Notes that were consumed by `/retro` are already gone; clear
   any remaining stale notes with a warning ("these notes were never
   addressed").
5. **Flag unclosed designs**: remind if accepted designs appear complete.
6. **Confirm**: show changes, let user adjust before ending.

## 4. The `philset` CLI

Distribute as an npm package. Replace `~/Development/.claude/bin/praxis`.

### Commands

**`philset init`** — First-time setup on a new machine.
- Prompt for root development directory (default: `~/Development`)
- Create `{root}/.meta/` with `signpost.yml` (`root: true`),
  WORKFLOW.md template, and `references/` directory with format docs
- Init `{root}/.meta/` as a git repo
- Install skills to `~/.claude/skills/`
- Print: "You're set up. Run `philset begin` in any project directory,
  or launch claude and type `/hello`."

**`philset begin [--dsp]`** — Start a session.
- If `.meta/` doesn't exist in cwd, scaffold it (same as `/hello` Step 4,
  but non-interactive)
- If `CLAUDE.md` doesn't exist, create from template
- Launch `claude` (or `claude --dangerously-skip-permissions` with `--dsp`)

**`philset dsp`** — Alias for `philset begin --dsp`.

**`philset update`** — Update skills and reference docs to latest version.
- Overwrite `~/.claude/skills/` with the latest from the package
- Update `{root}/.meta/references/` with the latest reference docs
- Report what changed (diff skill files and reference docs)

**`philset sync`** — Copy global skills into the current project's
`.claude/skills/`.
- For repos that want project-local skills (multi-contributor repos where
  not every contributor has philset installed)
- Copies from `~/.claude/skills/` → `.claude/skills/`
- Reports what changed

**`philset sync --remove`** — Remove project-local skills.
- Delete `.claude/skills/` from the current project
- Reconfigure to rely on global skills instead

### Package structure

```
philset/
├── package.json
├── bin/
│   └── philset.js              # CLI entry point
├── skills/
│   ├── hello/skill.md
│   ├── assess/skill.md
│   ├── draft/skill.md
│   ├── ship/skill.md
│   ├── review/skill.md
│   ├── retro/skill.md
│   └── ttyl/skill.md
├── templates/
│   ├── CLAUDE.md               # Self-sufficient project template
│   ├── meta-README.md          # .meta/ convention explainer
│   ├── signpost.yml            # Default signpost
│   ├── signpost-root.yml       # Root signpost (root: true)
│   └── WORKFLOW.md             # User context template
├── references/                 # File format examples for philset conventions
│   ├── designs-index.md        # designs/index.md format + status values
│   ├── decisions-format.md     # decisions.md entry format
│   ├── in-progress-format.md   # in-progress.md section structure
│   └── signpost-schema.md      # signpost.yml fields + inheritance
└── README.md
```

### npm metadata

- Package name: `philset` (available on npm, unscoped)
- License: MIT
- Bin: `philset`

## 5. WORKFLOW.md Refresh

Move from `~/.claude/WORKFLOW.md` to `~/Development/.meta/WORKFLOW.md`
(the tree root). Update all projects to remove explicit references (small
finite set — chipper, praxis, meta, html/philbas.com). No symlink needed.

**Remove:**
- References to `.claude/PROJECT_STATUS.md` (dead convention)
- `praxis begin` / `praxis awake` references
- `Maintain .claude/PROJECT_STATUS.md` section

**Add:**
- `.meta/` convention (briefly — each `.meta/README.md` has details)
- Two-cadence model overview
- Skill pipeline: `/hello` → `/assess` → `/draft` → `/ship` → `/review` → `/retro` → `/ttyl`
- "Frontloading design iteration pays off" (from Chipper session)
- philset CLI reference

**Keep everything else** — communication style, code conventions, Phil's
worldview section, git habits. These are stable and valuable.

## 6. Incremental Polish (Ship Alongside)

- [x] Clean up boilerplate CLAUDE.md in inactive directories (14 files → minimal stubs)
- [x] Populate `html/.meta/` with domain-level context (signpost.yml, conventions.md)
- [x] Update `html/CLAUDE.md` from boilerplate to real content
- [x] Remove `~/Development/.claude/bin/praxis` and `~/Development/.claude/templates/`
- [x] Update Praxis CLAUDE.md to remove explicit WORKFLOW.md reference
- [x] Verify Chipper CLAUDE.md doesn't reference WORKFLOW.md (confirmed clean)
- [x] Create `~/Development/.meta/` with root signpost + WORKFLOW.md + reference docs
- [x] Init `~/Development/.meta/` as its own git repo
- [x] Move `logical-architecture.md` from project root to `.meta/` in Praxis
- [x] `/hello` skill: version check warning for stale project skills (in Step 7)
- [x] Scaffold `.meta/` in all ~/Development directories (25 dirs)
- [x] Remove legacy `.claude/` state dir handling from all skills
- [x] Create reference docs at tree root (`references/` directory)

## Resolved Questions

1. **npm name availability.** `philset` is available on npm. Unscoped.

2. **signpost.yml schema.** Minimal: `root`, `name`, `ignore`,
   `architecture`. All optional. File itself optional. Defaults are
   sensible (`root: false`, `architecture: true`). Designed for
   extension — future flags (PM integration, etc.) follow the same
   pattern.

3. **WORKFLOW.md git tracking.** `~/Development/.meta/` is its own git
   repo.

4. **Transition plan.** Update all projects directly (small finite set),
   then move WORKFLOW.md. No symlink.

5. **Stop condition.** signpost.yml with `root: true`. Hard ceiling at
   `~`. No git-root heuristic.

6. **`philset begin` launches claude.** Yes. `--dsp` flag for skip
   permissions. `philset dsp` as alias.

7. **Domain `.meta/` structure.** Mirror full project structure. Let
   usage reveal what accumulates at domain level over time. `/retro`
   assesses which tree level is correct for each insight.

8. **logical-architecture.md location.** Moves to `.meta/`. Created by
   `/hello` on offer. Declined = `architecture: false` in signpost.yml,
   never asked again. Inherited: parent `false` applies to children
   unless overridden.

9. **Breadcrumb notes lifecycle.** Notes persist until consumed by
   `/retro`, not cleared by `/ttyl`. `/ttyl` clears stale leftovers
   with a warning.

10. **Skill cadences.** `/hello` + `/ttyl` = developer session (workday).
    `/draft` + `/review` = development session (feature branch). Orthogonal.

11. **Agent orientation.** Step 0 preamble in `/hello` skill definition,
    not in user-facing output. Explains `.meta/` persistence and two
    cadences to the agent. Skipped if already seen today.

## Future (v0.3+)

- PM integration via signpost flags (Praxis, JIRA, Monday). Skills
  auto-update tickets: `/draft` → in progress, `/ship` → attaches design,
  `/review` → in review. Deserves a dedicated design session.
- Automated skill sync checks (beyond `/hello` warning)

## Out of Scope

- Auto-memory inheritance across projects (Claude Code's domain)
- CI/CD integration
- MCP server integration (Praxis MCP is a separate track)
- Per-contributor skill customization
- IDE-specific configuration (VS Code settings, etc.)
- Multi-developer merge conflict resolution beyond `/review` flagging
