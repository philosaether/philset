# Reference: skim/

Durable recognition artifacts produced by `/skim`. One file per domain at
`.meta/skim/<topic>.md`, indexed in `.meta/skim/index.md`. A skim doc is the record
of taking a domain **from ignorance to vague familiarity** — researched, taught in
batched 1–2-paragraph lessons with a quiz per item, distilled to a one-line-each
summary. It's the sheet you re-skim before the room, not a deep study.

`/skim` is the **breadth-first sibling to `/study`** (`/skim` is to `/study` what
`/riff` is to `/draft`): its own directory + index. Both formalize the **gather** half
of the gather→act cycle — a skim is lighter prior research, still citable by `/assess`
and `/draft`.

## Format

```markdown
# <Domain> — Skim Doc

<What this is.> **Loop:** research + build the item list → batch ~5 by affinity →
teach 1–2 paragraphs each (source-grounded) → quiz each → score → final one-line-each
summary marked cold/fuzzy/known.

Goal: <why we're skimming — frames how tight the recognition bar is.>

**Source anchors:** <refs each lesson is grounded in — often gathered via research.>

## Item list        <!-- signed off before teaching; everything starts unknown -->

## Batch 1 — <affinity name>
<1–2 paragraphs per item, source-grounded, never from priors.>
### Quiz            <!-- added AFTER the paragraphs, one Q per item -->

## Summary          <!-- the deliverable + final exam, filled by Claude at the end -->
| Term | One-line summary (what / like-what / how-different) | Status |
|------|-----------------------------------------------------|--------|
| …    | …                                                   | cold/fuzzy/known |
```

## The one contract: recognition, not reconstruction

The exit bar is **one true sentence + placement**: *what is it, what is it like, how
is it different.* Anything that needs the mechanism itself **graduates to a `/study`**
(the item becomes a study target; anchors carry over). Deciding *what deserves the deep
dive* is a headline reason to skim.

## Completion

**One dimension** (unlike `/study`'s two orthogonal criteria): every item is taught,
quizzed, and carries a summary line marked `cold` / `fuzzy` / `known` — or explicitly
**parked** (not worth recognizing; logged, not silently dropped). `known` across the
board is the aspiration; **`fuzzy` is an acceptable resting state** — that's the *vague*
in vague familiarity.

## Guidelines

- **Start from ignorance.** No upfront "mark what you know" pass — the domain is
  unknown by premise; the active-recall cost lives in the per-item quiz.
- **Research is the point.** Building the list for a bare-name domain is real web
  research — the "replaces three hours on Google" step, not a preamble to it.
- **Source-grounded, never from priors.** Shallow ≠ ungrounded. Cite a real source per
  lesson; **verify before you teach or quiz.** A confident-wrong line is worse than none.
- **Batched, quiz after the paragraphs.** ~5 related items by affinity (an
  order-of-magnitude default, not a rule); never pre-stage the quiz.
- **Lighter retention on purpose.** Optimize coverage, not mastery. Don't grind an item
  to `known` when recognition was the goal.
- **Learner's voice, in bullets.** Preserve raw notes/answers as bullet lists; reserve
  the one table for the Claude-filled summary.
- **Skims stay in `skim/`.** Durable reference; never archived or graduated (a
  `/refresh` target once that exists).
