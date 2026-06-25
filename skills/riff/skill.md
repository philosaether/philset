---
name: riff
description: Lightweight iteration mode for grab-bag branches. Creates a track file, enforces note-before-code for non-trivial changes, and uses /defer as the scope-escalation escape hatch. Always user-invoked.
---

# Riff

The user typed `/riff <scope>` — enter lightweight iteration mode.
Improvisation within structure: you know the key and the chord changes,
but you're not reading sheet music.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Scope gate

State the scope back to the user in one line. If the user didn't provide
a scope, ask: "What are we riffing on?"

This scope is the contract. Changes within scope proceed via
note-before-code. Changes outside scope get `/defer`ed.

## Step 2: Branch

- **On main**: create a `riff/<topic-slug>` branch.
- **On a `riff/` branch**: proceed — you're already in riff mode.
- **On a `feature/` branch**: ask — the user may want to riff within
  an existing feature branch. If so, create the track on the feature
  branch without renaming it.

## Step 3: Create the track

Create `tracks/<branch-name>.md` in the project's `.meta/`:

```markdown
# riff/<topic-slug>

<One-line scope description.>

Started: <today>

## Targets

<Aspirational, not prescriptive — items under consideration this session.
If the riff is backlog-driven, populate by pulling candidate items from
`roadmap.md` and/or `inbox/todo.md`. They're candidates, not commitments.
Omit the section if the riff isn't drawing from the backlog.>

---
```

If `tracks/` doesn't exist, create it. One track per branch.

If the riff is drawing from the backlog, ask which roadmap/todo items are in
scope and list them under `## Targets`. Played notes graduate matching
targets (Step 4e).

If resuming a riff on an existing branch (track file already exists),
read the existing track and continue from where it left off.

## Step 4: Work

The iteration loop. Repeat until the scope is covered:

### 4a: Surface a change

From the user's direction, from what you observe, or from gaps that
appear during implementation.

### 4b: Note-before-code

**Threshold**: does this change introduce behavior or a concept? If yes,
write a numbered note to the track *before* implementing:

```markdown
## Note 3: contingentOn presence shorthand

<What we're doing and why. Enough detail to implement from.>
```

Then **wait for the user to annotate or approve**. The note is the
lightweight equivalent of a /draft — skipping sign-off defeats the
purpose.

Bug fixes, one-line changes, and mechanical adjustments skip this step
— go straight to code with a descriptive commit message.

### 4c: Build

Implement the approved note. Commit with a descriptive message. No
special commit prefix — the `riff/` branch provides context in git log.

### 4d: Verify

Confirm the change works before moving on. Use whatever tight feedback
loop fits the change — the goal is fast, concrete verification, not
formal testing. One round-trip should tell you if it's right.

### 4e: Freeze the note

Once verified and committed, the note is "played." Don't revise played
notes — append new notes for follow-up work.

If the played note completes a `## Targets` item (or a matching `roadmap.md`/
`todo.md` entry), graduate it per the archival convention
(`references/archival.md`): append to `archive/rearview.md` with a
`Completed: <date> (<branch>)` stamp and remove it from its source. Confirm
before removing a hand-curated backlog item.

### 4f: Continue or escalate

- Next change is in scope → go to 4a
- Exceeds scope → `/defer` it and continue
- Done → go to Step 5

## Step 5: Close

When the work feels complete, remind the user:

> "Run `/review` before merging — it's non-negotiable, even for riffs."

Don't auto-invoke /review. Don't end the riff explicitly — `/review`
handles the merge gate, `/ttyl` handles session cleanup.
