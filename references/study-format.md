# Reference: study/

Durable learning artifacts produced by `/study`. One file per topic at
`.meta/study/<topic>.md`, indexed in `.meta/study/index.md`. A study doc is the
record of *learning a system that already exists* — read to-the-metal, in
stages, with a quiz loop that builds retention. It is the conversation artifact,
not a summary.

`/study` formalizes the **gather** half of the gather→act cycle. Studies are
first-class sources: `/assess` and `/draft` may cite a study.

## Format

```markdown
# <Topic> — Study Doc

<What this is.> **Loop per stage:** write → annotate inline → comment → targeted
quiz → answer inline → score + log. Scored review + weak-spots in `## Quiz Log`.

Goal: <why we're learning.>

**Source anchors:** <real file/dir paths or source refs.>

## Mastery Targets        <!-- optional -->
## Study Products         <!-- optional -->

## Stage map
1. **<Stage>** — <scope.> *(written below / studied <date>)*

## Stage 1 — <name>
<to-the-metal, real symbols. Learner annotates inline.>
### Quiz                  <!-- added AFTER the stage is annotated -->

## Quiz Log
### <date> — Stage 1
**Q1. …** — Learner: … — Score: ✓/✓ partial/✗ — Correction: <mechanism>
**Revisit:** …
```

## The two optional axes

- **Mastery Targets** — what to *understand*. A minimum viable surface: the
  precise domains that must be mastered. Seeded from an external brief,
  gathered with the learner, or empty. They **bias quiz targeting** and **gate
  completion**. Promotion of a Revisit item to a target is **forward-only**.
- **Study Products** — what to *produce* beyond retention. Goal-shaped:
  interviewer-questions / probe-answers sheet / practical advice / none.
  Generalizes the original `questions-for-<X>.md` companion. May live inline as
  a `## Study Products` section or as a standalone companion file.

## Completion

Two orthogonal criteria:

1. **All stages studied.**
2. **Minimum viable surface covered** (only applies when mastery targets exist).

A study **with** targets is done only when **both** clear, and may grow new
stages until they do. A study **without** targets is one-dimensional — done when
stages are done.

## Guidelines

- **Read the actual source.** Cite real `file`/`function`/`table` names; correct
  abstraction with ground truth. **Verify before you quiz or grade.**
- **Strictly one stage at a time.** No writing ahead — stages build on each
  other and one-at-a-time blocks passive skimming.
- **Quiz after the notes, targeted at weakness.** Never pre-stage a quiz.
- **Scoring vocabulary:** `✓` / `✓ partial` / `✗`, flag a `✗` that is a
  **valuable miss** (new knowledge worth the stumble).
- **Preserve the learner's voice.** Inline annotations and raw quiz answers are
  part of the artifact's value — don't paraphrase them away.
- **Studies stay in `study/`.** Durable reference; never archived or graduated.
