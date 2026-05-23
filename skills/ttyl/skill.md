---
name: ttyl
description: End-of-session housekeeping. Updates decisions.md and in-progress.md for the current project so the next session can pick up cleanly without --resume.
---

# ttyl

Session wind-down. Run this before ending a session.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Review the session

Silently review:
- Git log of commits made this session
- Current state of the project's `decisions.md` and `in-progress.md`
- What was accomplished, what's still open, what changed direction

## Step 2: Update decisions.md

Append any decisions made this session that aren't already logged. Follow the existing format (date + decision). Only log decisions that would be useful context for a future session — not every micro-choice. Check what's already in the file first — /ship and other skills may have already appended entries this session.

## Step 3: Update in-progress.md

Rewrite the Active and Parked sections to reflect current reality:
- Move completed items out of Active
- Add anything that came up but wasn't finished
- Park things that were deprioritized
- Keep it tight — this is read at session start
- Future work and ideas go in `roadmap.md`, not here — in-progress.md
  is present-tense only

## Step 4: Clean up breadcrumbs

If `breadcrumbs.log` exists in the state dir:

- **Crash-recovery content** (everything outside `## Notes`): clear it.
  Now that decisions.md and in-progress.md are updated, it's redundant.
- **`## Notes` section**: increment every note's session counter by 1.
  If any notes have a counter of 5 or higher (they were surfaced in
  `/hello` and still not addressed), delete them silently and print:
  "Notes cleared: [list]". Leave all other notes in place.

Don't delete the file — the hook expects it to exist.

## Step 5: Flag unclosed designs

Check `designs/` for any accepted designs whose work appears
complete (based on git log and in-progress.md). If found, remind the
user — they may want to run `/review` to formally close them before ending.
Don't block on this.

## Step 6: Confirm

Show the user what you wrote/changed so they can adjust before the session ends.
