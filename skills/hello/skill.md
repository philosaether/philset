---
name: hello
description: Session startup. Walks the .meta/ tree to load user and domain context, orients to the current project, and gives a brief status summary so we can hit the ground running.
---

# Hello

Session startup ritual. The user typed `/hello` — orient yourself.

## Step 0: Philset orientation

Skip this step if you've already seen it today.

This skill is part of the `philset` Claude Code skills library. All philset
skills depend on the `.meta/` directory for session persistence. This
directory will be referenced repeatedly throughout the working session,
and should be your first stop for reading or writing context.

philset uses two cadences:
- **Developer session** (workday): `/hello` opens, `/ttyl` closes. These
  persist state in `decisions.md` and `in-progress.md`.
- **Development session** (feature branch): `/draft` opens, `/review`
  closes. These scope and gate feature work.

The cadences are orthogonal — a feature may span multiple workdays, or
multiple features may ship in one day.

Update `decisions.md` during conversation as decisions are made — don't
wait for a skill invocation.

philset overrides the following Claude Code skills by default:
- `/plan` and `/ultraplan` — replaced by the assess → draft → ship
  flow, which produces collaborative design docs instead of
  approve-then-execute plans

Do not invoke these skills unless the user's signpost.yml sets
`allow-plan: true`. If the user explicitly asks for plan mode
(e.g., "enter plan mode", "use /plan"), comply — the override is
a default, not a prohibition.

If you notice collaboration friction during the session — conflicting
guidance, repeated rejections, mismatched expectations — invoke `/retro`
yourself to diagnose it. Don't wait for the user to ask.

If you recognize deferral intent during the session — "add that to the
roadmap," "we'll deal with that later," "put that on PE's backlog" —
invoke `/defer` yourself. Don't wait for the user to type `/defer`.

## Step 1: Tree walk

Discover context by walking up from the current working directory:

1. Start at cwd
2. Walk up one directory at a time
3. At each level, if `.meta/` exists, collect it (and read `signpost.yml` if present)
4. Stop when you find a `signpost.yml` with `root: true`, or reach `~`
5. Merge inherited signpost flags (child overrides parent)
6. At each level with a `.meta/`, note sibling directories for neighborhood awareness

**Read context outermost-first** (root → domain → project):
- From the root `.meta/`: read `WORKFLOW.md` (user context)
- From intermediate `.meta/` dirs: read context files (domain conventions),
  plus `roadmap.md` and `inbox/todo.md` if they exist (domain-level items
  surface during `/hello` on any project under that domain)
- From cwd `.meta/`: this is the project level, read in Step 3

**Fallback**: If you reach `~` without finding a root signpost, check
`~/.claude/WORKFLOW.md` instead. If found, use it silently but append a
note to `breadcrumbs.log` `## Notes`:
`- (0) No philset root found — suggest philset init to set up context tree.`
`/retro` will pick this up later. All notes use this format:
`- (n) description` where `n` is a session counter incremented by `/ttyl`.

**signpost.yml fields** (all optional, file itself optional):

| Field | Default | Purpose |
|-------|---------|---------|
| `root` | `false` | Stop condition for tree walk |
| `name` | dirname | Display name in status readouts |
| `ignore` | `[]` | Directories to skip during sibling listing |
| `architecture` | `true` | Whether to maintain `.meta/logical-architecture.md`. Inherited down the tree; child can override. |
| `links` | `{}` | Named shortcuts to frequently-used files. Merged across tree walk (parent + child, child overrides on key collision). |
| `allow-plan` | `false` | Re-enable `/plan` and `/ultraplan` for this directory tree. |
| `archive-screenshots` | `false` | Keep consumed screenshots at `/ttyl` instead of deleting them. |
| `calendar` | `false` | Surface today's calendar at session start (Google Calendar MCP). Opt-in; inherited down the tree. |

When reading signpost.yml at each level, collect any `links` entries
into a merged map (outermost-first, child overrides on key collision).
After the walk completes, store the assembled links in `breadcrumbs.log`
under `## Quick Links` so they survive context compaction:

```
## Quick Links
- career-plan: ~/Development/meta/.meta/designs/career-trajectory.md
- workflow-improvements: ~/Development/meta/.meta/inbox/workflow-improvements.md
```

## Step 2: Read CLAUDE.md

Read the current project's `CLAUDE.md` (if it exists). Follow any
instructions it contains — these are project-specific and take precedence.

## Step 3: Read project state

Check for `.meta/` in cwd:

**If `.meta/` exists:** Read what's in it — whatever exists, read it;
whatever doesn't, skip it:
- `decisions.md` — decision history
- `in-progress.md` — current work state
- `roadmap.md` — future work and deferred items
- `designs/index.md` — active designs (note any accepted design whose
  frontmatter carries an amendment with `status: proposed` — surface in Step 7)
- `tracks/` — riff scratchpads (if any exist, note them)
- `study/` — staged learning docs (note any in-progress studies; surfaced in Step 5)
- `inbox/` — items waiting for review (including `todo.md`)
- `logical-architecture.md` — codebase map (handled in Step 4)
- `signpost.yml` — already read during tree walk

**If `.meta/` doesn't exist:** Offer to scaffold it:

> "This project doesn't have a `.meta/` directory yet. Want me to set
> one up? (decisions.md, in-progress.md, designs/, assessments/, inbox/)"

If the user says yes, create:
- `.meta/README.md` with convention explainer:
  ```
  # .meta/

  Project working state. Tracked in git, maintained by the team.

  - `decisions.md` — Append-only decision log. Add entries, never edit old ones.
  - `in-progress.md` — Current work state (Active, Parked). Present-tense only.
  - `roadmap.md` — Future work and deferred items. Append-forward via `/defer`.
  - `designs/` — Design docs. Created with `/draft`, implemented with `/ship`.
  - `tracks/` — Riff scratchpads. Created with `/riff`, one per branch.
  - `study/` — Staged learning docs. Created with `/study`; durable, citable.
  - `assessments/` — State-of-the-world snapshots. Created with `/assess`.
  - `inbox/` — Drop files here for review (screenshots, references, etc.).
    - `todo.md` — Inbound items from cross-project deferrals or manual capture.
  ```
- `.meta/decisions.md` — header + empty log
- `.meta/in-progress.md` — header only
- `.meta/roadmap.md` — header only
- `.meta/designs/.gitkeep`
- `.meta/tracks/.gitkeep`
- `.meta/study/.gitkeep`
- `.meta/assessments/.gitkeep`
- `.meta/inbox/todo.md` — header only

If no, proceed without it — never force scaffolding.

## Step 4: Offer logical-architecture.md

Check the resolved `architecture` signpost flag (inherited, child overrides
parent, default `true`).

If `architecture` is not `false` and `.meta/logical-architecture.md` does
not exist:

> "This project doesn't have a logical-architecture.md yet — it's a
> codebase map that helps me navigate and review code. Want me to
> generate one?"

If yes: scan the directory structure and create `.meta/logical-architecture.md`
with a first-pass map of the codebase (top-level dirs, key files, module
boundaries). The user will correct it over time.

If no: write `architecture: false` to `.meta/signpost.yml` (creating the
file if needed) and don't ask again.

**Maintenance**: If `.meta/logical-architecture.md` already exists, do a
quick consistency check against the actual directory structure. If new
top-level directories or modules have appeared since the last update,
append a note to `breadcrumbs.log` `## Notes`:
`- (0) logical-architecture.md may be stale — new directories: X, Y`.
Don't auto-fix.

## Step 5: Orient to the working directory

Quick scan of the project: `ls`, check git status, note the branch and
any uncommitted work. Don't go deep — just enough to know where things
stand.

If on a `riff/` branch and a matching track file exists in `tracks/`,
read it — you're resuming a riff session. Surface the track in the
summary: "On riff/demo-polish, track has 4 notes (3 played, 1 in
progress)."

If `study/` exists, check for in-progress studies (status not `complete`)
and surface them in the summary the way riffs are surfaced:
"`.meta/study/honcho.md` — 4 of 7 stages studied." A multi-day study is
exactly the resume case worth flagging at startup.

Read `.meta/logical-architecture.md` if it exists — it's the authoritative
map for navigating and adding to the codebase.

## Step 6: Surface aged notes

Check `breadcrumbs.log` `## Notes` for any notes with a session counter
of 5 or higher. If found, surface them to the user before the summary:

> "This note has been carried for 5 sessions: [note]. Should we address
> it now, or should I drop it?"

If the user says drop it, remove the note. If they want to address it,
handle it before continuing. If they defer, leave the note — `/ttyl` will
clear it at end of session.

## Step 6.5: Surface today's calendar (if enabled)

Only if the resolved `calendar` signpost flag is true (inherited down the
tree, so setting it once at the root turns it on everywhere). If the flag is
false or absent, skip this step entirely — philset must work with no external
dependency.

When enabled and a Google Calendar MCP tool is available:

1. Read **today + early next morning** in a single `list_events` call (window:
   now → tomorrow ~10am — one API call, so session-start stays light). The
   early-morning reach means an evening session warns about an early start the
   next day, instead of hiding it behind the day boundary.
2. Surface them in the summary (Step 7): "2 meetings today (3pm mixer, 5pm warm
   intro); tomorrow starts early — 7:30am with Sam." If the wider week is busy,
   add a one-line tail: "3 more this week."
3. **Meeting prep, on demand.** If a meeting has identifiable attendees/people
   and a contacts source is available (Google Contacts / Gmail MCP), don't
   auto-pull their info — *offer* it: "Want me to pull contact context for
   tomorrow's attendees?" This keeps `/hello` light while making the CRM
   *who* relation one step away when it's actually wanted.

The "N more this week" tail is a *count*, not a full listing — a cheap
lookahead cue. Only expand it if the user asks.

If the flag is on but no calendar MCP tool is available, note it once quietly
and continue — don't error or block the summary.

## Step 7: Brief summary

Give the user a short status readout:
- What project this is and what it's for
- What `.meta/` state was found (e.g., "14 decisions, 2 active designs,
  3 items in progress, 8 roadmap items" — concrete, not categorical)
- What's currently in progress (if in-progress.md exists)
- Today's calendar, if the `calendar` flag surfaced any (Step 6.5)
- Roadmap highlights: total items, plus any with `Due:` dates within 14
  days ("2 roadmap items approaching deadline")
- Any inbox items waiting (including todo.md entries needing triage). If
  `todo.md` has grown large (~10+ open items), nudge: "todo.md has N items —
  want to run a /triage session?"
- Any accepted design carrying a *proposed* (unaccepted) amendment — surface
  it; living designs with open amendments are easy to forget
- Any uncommitted work or notable git state
- Tree context loaded (e.g., "loaded user context from ~/Development/.meta/,
  domain context from html/.meta/")

If the project has skills in `.claude/skills/` or global skills in
`~/.claude/skills/`, list them briefly:
> "Available skills: /hello, /assess, /draft, /ship, /review, /retro, /ttyl"

For projects with no skills available, skip this line.

If quick links were collected during the tree walk, display them with
clickable file paths:
> Quick links: [career-plan](~/Development/meta/.meta/designs/career-trajectory.md), [workflow-improvements](~/Development/meta/.meta/inbox/workflow-improvements.md)

**Skill version check**: If both project-local skills (`.claude/skills/`)
and global skills (`~/.claude/skills/`) exist, compare them. If project
skills appear older, warn: "Project skills may be behind global — consider
running `philset sync`."

Keep it to a few lines. Be concise. Then wait for direction.
