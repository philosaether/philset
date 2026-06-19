# Skill proposal: `/study` — staged source-grounded learning

Captured 2026-06-19 from a live session (meta/interview-prep) where we used this
workflow to learn the Honcho codebase to-the-metal before an interview. The
rhythm worked extremely well; this spec reproduces it. Write the real `skill.md`
from this.

Reference artifacts produced by this workflow (read these for tone/structure):
- `meta/.meta/honcho-internals.md` (the canonical example — staged study of an
  external codebase)
- `meta/.meta/reference-architecture.md` (the precursor — same quiz-log pattern)

---

## What it is

A skill for **deeply learning an existing system** (a codebase, an architecture,
a body of primary source) by reading the *actual source* and working through it
in **stages** with a tight write → annotate → quiz → review loop. Produces a
durable, shareable study document.

Distinct from the existing skills:
- `/assess` = snapshot the state of *our* system to feed design work.
- `/draft` = design something new.
- `/study` = *learn* something that already exists, rigorously, with retention.

Working name `/study` (alternatives: `/learn`, `/deep-study`). Decide in session.

## When to use

- Onboarding to an unfamiliar codebase or dependency.
- Interview prep (learn the target company's open-source system).
- Understanding a primary source (paper + reference implementation) well enough
  to reason past it, not just recite it.

## The artifact

A single study doc (e.g. `.meta/<topic>-internals.md`) with:

1. **Header** — what this is; **source anchors** (real file/dir paths or source
   refs); a one-paragraph description of the loop; the goal (why we're learning).
2. **Stage map** — numbered stages, one-line scope each, + a pacing note.
3. **Stages** — each written to-the-metal, grounded in **real file/function/
   table names** (read the source; don't summarize from memory or marketing).
4. **Per-stage `### Quiz`** block (added after the stage is studied).
5. **Quiz Log** (bottom) — dated per-stage entries: question, the learner's
   answer, a score, the correction/refinement, and a running **Revisit**
   (weak-spots) list.

When studying for a meeting/interview, also maintain a parallel
**questions-for-X log** for questions that surface during study (see
`meta/.meta/honcho-questions-for-vineeth.md`).

## The per-stage loop (the rhythm — this is the heart of it)

1. **Claude writes the stage** — to-the-metal, citing real symbols. One stage at
   a time by default.
2. **Learner reads and annotates INLINE** (not a separate notes block — comments
   live next to the prose they react to).
3. **Claude comments on the notes** — affirm strengths *specifically*; correct
   misconceptions *precisely, with the mechanism*; name the "valuable misses."
4. **Claude crafts a TARGETED quiz** — probing the soft spots the notes exposed,
   *not* the things the learner clearly nailed. Posted as a `### Quiz` block at
   the end of that stage. **Do not pre-stage the quiz** — it must be informed by
   the notes.
5. **Learner answers inline** (preserve raw answers — the study trail is itself
   valuable, e.g. shareable evidence of process).
6. **Claude scores + logs** to the Quiz Log, updates Revisit, then **unlocks the
   next stage.**

## Core principles (what made it work)

- **Read the actual source.** Fetch/grep real files; cite file/function/table
  names. Correct marketing/abstraction with ground truth.
- **Verify before you quiz/grade.** Confirm a mechanism in source before
  asserting it or building a question on it — don't grade against a guess.
- **Quiz after the notes, targeted at weaknesses.** Redundant questions on mastered
  material waste the loop.
- **Scoring vocabulary:** `✓` / `✓ partial` / `✗`, and explicitly flag a `✗` that
  is a *valuable miss* (new knowledge worth the stumble).
- **Inline annotation**, learner's voice preserved.
- **Pace to the learner.** One stage at a time; offer to write 2–3 ahead for
  bigger chunks; respect "I'm hitting my ingestion limit" — stop cleanly.
- **Revisit list** captures deferred deep-dives (topics flagged "later") so they
  aren't lost.
- **Affirm + connect.** Tie new mechanisms back to the learner's own prior
  reasoning and to adjacent knowledge (it cements retention and builds
  confidence).

## Inputs / args

- Target (repo URL / path / source set) and source anchors.
- Goal (free text — e.g. "interview prep for Plastic Labs").
- Optional: stage count / depth, pacing preference.

## Open questions for the authoring session

- Name: `/study` vs `/learn` vs `/deep-study`.
- Genericize the doc's voice (currently "Phil studies…") for multi-user repos,
  per the skill-onboarding convention.
- Where the doc lives (`.meta/<topic>-internals.md`? a `study/` subdir?).
- How it interacts with `/hello` resume (surface in-progress study docs?).
- Whether the parallel questions-log is part of the skill or a separate concern.
- Quiz-log placement: per-stage inline `### Quiz` + bottom scored log worked;
  confirm that's the canonical structure (vs. a single bottom log).
