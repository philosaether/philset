---
Status: accepted
Date: 2026-05-23
Accepted: 2026-05-23
Assessment: ../assessments/riff-skill.md
---

# /riff Skill — Desired State

Formalize /riff as a philset skill for lightweight iteration. /riff fills
the gap between "just do it" and "design it first" — structured enough
to prevent cowboy coding, light enough to not slow down grab-bag work.
Companion change: promote `tracks/` to a canonical `.meta/` directory.

---

## Three Scales of Change

philset now covers the full spectrum:

| Scale | Mode | Artifact | Gate |
|---|---|---|---|
| Mechanical / trivial | Just commit | git log | None |
| Small / straightforward | `/riff` | track file | Note-before-code |
| Large / foundational | `/draft` → `/ship` | design doc | Design approval |

The boundary between riff and draft is intuitive, not formal. "Does this
feel like it needs a design doc, or can I describe it in a track note?"
As a project matures, the proportion of riffs to drafts rises — more of
the architecture is settled, more changes are incremental.

## Invocation

```
/riff <scope description>
```

The scope description names what you're working on: "demo page polish,"
"fix the three display bugs," "add video embed to the philset page."
This becomes the scope gate — both parties know when it's being exceeded.

If the user doesn't provide a scope, ask: "What are we riffing on?"

## The Protocol

### Step 1: Scope gate

State the scope back to the user in one line. This is the contract:
changes within scope proceed via note-before-code. Changes outside scope
get `/defer`ed.

### Step 2: Branch

Create a `riff/<topic-slug>` branch if not already on one. If already
on a `riff/` branch, proceed.

If on `main`: create the branch. If on a `feature/` branch: ask — the
user may want to riff within an existing feature branch rather than
creating a new one.

### Step 3: Create the track

Create `tracks/<branch-name>.md` in the project's `.meta/`:

```markdown
# riff/<topic-slug>

<One-line scope description.>

Started: <today>

---
```

If `tracks/` doesn't exist, create it. One track per branch — if
resuming a riff on an existing branch, read the existing track and
continue from where it left off.

### Step 4: Work (the loop)

The iteration loop:

1. **Surface a change** — from the user's direction, from what you
   observe, or from gaps that appear during implementation.

2. **Note-before-code** — if the change introduces behavior or a concept,
   write a numbered note to the track *before* implementing:
   ```markdown
   ## Note 3: contingentOn presence shorthand

   <What we're doing and why. Enough detail to implement from.>
   ```
   Then wait for the user to annotate or approve. The note is the
   lightweight equivalent of a /draft — skipping sign-off defeats the
   purpose.

   **Threshold**: "Does this change behavior or introduce a concept?"
   If yes, note first. Bug fixes, one-line changes, and mechanical
   adjustments can go straight to code with a descriptive commit message.

3. **Build** — implement the approved note. Commit with a descriptive
   message. No special commit prefix needed — the `riff/` branch provides
   context in git log.

4. **Verify** — the iteration engine depends on the type of change:
   - **Visual**: SII loop (screenshot → tweak → screenshot)
   - **Logic**: test/verify loop (run → check → fix → run)
   - **Both**: alternate as needed

5. **Freeze the note** — once the change is verified and committed, the
   note is "played." Don't revise played notes — append new notes for
   follow-up work.

6. **Repeat** or **escalate**:
   - If the next change is in scope → go to step 1
   - If it exceeds scope → `/defer` it and continue
   - If you're done → go to Step 5

### Step 5: Close

When the work feels complete:

1. Remind the user to run `/review` before merging. Don't auto-invoke —
   just remind. "/review is non-negotiable, even for riffs."
2. Don't end the riff explicitly — `/review` handles the merge gate,
   `/ttyl` handles session cleanup.

## Track File Format

Tracks are design scratchpads, not session logs. They contain things that
need iteration between the user and Claude. Bug fixes and mechanical
changes go straight to commits with descriptive messages — git log is the
session log.

```markdown
# riff/<topic-slug>

<One-line scope description.>

Started: <today>

---

## Note 1: <topic>

<Design content. Iterated in place until approved, then frozen.>

## Note 2: <topic>

<Next item. Notes accumulate as the session progresses.>
```

### What goes in a note

- Changes that introduce behavior or concepts
- Design alternatives considered (lightweight tradeoffs)
- Things that surprised you during implementation

### What does NOT go in a note

- Bug fixes (commit message is sufficient)
- Mechanical changes (renaming, formatting)
- Things already decided in a design doc

### Append-forward model

Notes are iterated on in place until played, then frozen. You don't
revise Note 1 after moving to Note 3. If Note 1's approach turns out
to be wrong, write a new note explaining the correction — don't rewrite
history.

## tracks/ as Canonical `.meta/` Directory

`tracks/` joins `designs/` and `assessments/` as a project-level
directory. This means:

- `philset begin` scaffolds it (`.gitkeep`)
- `/hello` reads it if tracks exist ("2 tracks, 1 active on current
  branch")
- Reference doc describes the format

### /hello riff-mode awareness

When `/hello` detects a `riff/` branch:

- Read the track file for that branch (if it exists)
- Surface it in the status summary: "On riff/demo-polish, track has
  4 notes (3 played, 1 in progress)"
- Skip the design-doc-oriented status ("no active designs") — riff
  sessions don't use design docs

## Skill Interactions

| Skill | Change |
|---|---|
| `/hello` | Detect `riff/` branches, read track file, surface riff-mode status |
| `/defer` | Primary escape hatch from riff — scope escalation |
| `/review` | Track reconciliation: compare notes against commits, flag unplayed notes. Remind before merge. |
| `/draft` | No change — /riff is the alternative to /draft, not a wrapper around it |
| `/ship` | No change — riffs don't produce design docs to accept |
| `/ttyl` | No change — tracks are append-forward, not session-rewritten |
| `/retro` | No change — riff sessions can trigger /retro like any other |

### /review track reconciliation

When `/review` runs on a `riff/` branch with a track file, add a
reconciliation dimension (alongside the existing design reconciliation):

- Read each note in the track
- Categorize: played (implemented and committed), deferred (sent to
  roadmap via /defer), unplayed (written but not implemented)
- Flag unplayed notes — they may indicate forgotten work or scope that
  was silently dropped

This is lightweight — a few lines in the review output, not a separate
step.

## Tradeoffs

### Track archival: keep vs. archive after merge

**Keep in `tracks/`** (chosen):
- Tracks are small (the chipper track is 251 lines)
- They have lookup value: "why did we do X this way?"
- git blame on the track gives you the session context
- No index overhead — just `ls tracks/` or grep

**Archive to `archive/tracks/`** (rejected):
- Keeps `tracks/` lean for projects with many riff sessions
- Mirrors the assessment archival pattern
- But adds ceremony without clear benefit at current scale

**Would revisit if**: a project accumulates 20+ tracks and `tracks/`
becomes hard to scan. At that point, an index or archival convention
might be worth the overhead. For now, keep it simple and see how it
plays in practice.

### tracks/index.md: yes vs. no

**No index** (chosen):
- Notes never get superseded (unlike designs), so an index tracking
  individual note decisions would grow large without giving much benefit
- `ls tracks/` + grep covers the lookup use case
- The track filename encodes the branch name, which is usually enough

**With index** (rejected):
- Would give a bird's-eye view of all riff decisions
- But decisions that matter architecturally already land in `decisions.md`
- Adding every riff note to an index is overhead without clear payoff

**Would revisit if**: track lookup becomes a frequent pain point. The
index could be added later without changing the track format.

### Scope boundary: formal rule vs. intuitive judgment

**Intuitive judgment** (chosen):
- "Does this feel like it needs a design doc?" is the natural question
- The note-before-code protocol makes riffing safe even for concept-
  introducing changes (proven in the chipper session)
- A formal rule ("no new types") was violated in the first session and
  it was fine — the protocol, not the rule, was the guardrail

**Formal rule** (rejected):
- "No new types or engine concepts in a riff" would have blocked the
  chipper session's best work (dateExpression, contingentOn shorthand)
- Rules that get overridden in the first session aren't rules

**Would revisit if**: riff sessions consistently produce under-designed
architecture that needs rework. The note-before-code protocol should
prevent this, but if it doesn't, a harder boundary may be needed.

## Open Questions

1. **Track file on branches that don't start as riffs.** What if the user
   starts on a `feature/` branch and mid-session says "let's just riff on
   this"? Create a track on the feature branch? Rename the branch to
   `riff/`? Leaning: create the track, don't rename — the branch prefix
   is a convention, not a gate.
   - Agreed.
    - I'm tempted to call it a development smell, but honestly it may not be
    - If your feature is blocked by a tiny but unrelated issue, /riffing on it is likely the correct move

## Out of Scope

- **Track indexing or search tooling** — grep and `ls` are sufficient
  at current scale.
- **Auto-invocation of /riff** — unlike /defer and /retro, /riff is
  always user-invoked. It sets the session mode, which is a deliberate
  choice.
- **Interaction with /suspend** — riff branches are short-lived by
  design. If a riff needs suspension, it's probably graduated to /draft
  scope.
- **Session modes in /hello** — the to-do-annex item about "build
  sessions vs. devex sessions" is superseded by the three-scale model
  (mechanical / riff / draft).
