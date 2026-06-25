---
name: defer
description: Capture future work with automatic provenance and route it to the right project's roadmap or inbox. Use when scope exceeds the current session, or to build backlog from conversation. Agent-invoked when deferral intent is recognized.
---

# Defer

Backlog-building — "this matters, not now." The user said `/defer`, or
you recognized deferral intent in conversation (e.g., "add that to the
roadmap," "we'll deal with that later," "put that on PE's backlog").

`/defer` does NOT handle parking active work with a branch — that's
workstream suspension (`in-progress.md` Parked section).

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Parse the deferral

Extract from the user's message (or conversation context):

1. **What** — the item, in the user's words (lightly edited for clarity)
2. **Destination** — local (current project) or cross-project (named target)
3. **Resumption condition** — one of:
   - **Blocker**: "don't build until X"
   - **Deadline**: a date
   - **None**: pulled from the heap by salience

If any of these are ambiguous, ask — but only one question. Prefer
inferring from context over asking. The most common ambiguity is
destination: "Which project should own this?"

## Step 2: Route the item

### Local deferral (default)

The item stays in the current project. Append to `roadmap.md` in the
project's `.meta/`. If `roadmap.md` doesn't exist, create it:

```markdown
# Roadmap

Future work. Items land here via `/defer` or by hand. Each item says
what it is and what's blocking it (if anything). Organized by the user
into categories that make sense for the project.

---
```

### Cross-project deferral

The user named a target project (e.g., "defer to PE", "add that to
chipper's backlog").

1. Walk the signpost tree to find the target project directory
2. Append to `{project}/.meta/inbox/todo.md` (create parent directories
   if needed). If the file doesn't exist, create it with:
   ```markdown
   # To Do

   Items for triage. From cross-project `/defer` or manual capture.

   ---
   ```
3. If the target project is not found in the tree: ask for the path.
   Don't guess.

Cross-project items always land in `inbox/todo.md`, never directly
in `roadmap.md`. You don't have full project context from an external
session — the inbox is the staging area for triage during a local session.

## Step 3: Write the item

Use this format for both roadmap.md and inbox/todo.md entries:

```markdown
- **Item name** — Description.
  Deferred from: [project]/[branch] ([date]).
  Blocker: [condition] | Due: [date] | (omit line if none)
```

Append to the end of the file (before any trailing whitespace). Don't
attempt to categorize — the user organizes the file themselves.

Examples:

```markdown
- **Theming engine v2** — Runtime theme switching as a first-class
  library feature, not demo-only code.
  Deferred from: chipper/riff/demo-task-sentence (2026-05-21).
  Blocker: second consumer theme or npm publish prep

- **Grant application** — Apply for the grant Ronique identified.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
  Due: 2026-06-15

- **Student merch commissions** — Research commission structure and
  financial tracking for students who design PE merch.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
```

## Step 4: Log the decision

Append a one-liner to the current project's `decisions.md`:

```
2026-05-23: Deferred: grant application (to PE, due 2026-06-15).
2026-05-23: Deferred: theming engine v2 (blocker: second consumer theme).
2026-05-23: Deferred: student merch commissions (to PE).
```

For local deferrals, omit the "(to project)" — it's implied.

## Step 5: Confirm

Brief confirmation. One line per item:

> Deferred **grant application** → PE inbox (due 2026-06-15)
> Deferred **theming engine v2** → roadmap (blocker: second consumer theme)

Don't over-explain. The user can check the file if they want details.

Then return to whatever was happening before the deferral. `/defer` is
a side-channel — it shouldn't break the flow of the current work.
