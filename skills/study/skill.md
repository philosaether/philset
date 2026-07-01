---
name: study
description: Deeply learn a system that already exists — a codebase, an architecture, a primary source, or your own recent work — by reading the actual source in stages with a write→annotate→comment→quiz→score loop. Produces a durable study doc with retention built in. Use for onboarding, interview prep, primary-source mastery, or defending your own work. Distinct from /assess (snapshot our system) and /draft (design something new). Usually user-invoked; agent may suggest it when deep-learning intent appears.
---

# Study

The user typed `/study <topic>` — enter staged, source-grounded learning mode.

`/study` is for **deeply learning something that already exists**, with
retention. Where `/assess` snapshots *our* system to feed design and `/draft`
designs something new, `/study` *learns* — a codebase, an architecture, a body
of primary source, or your own recent work — by reading the **actual source**
and working through it in stages. The doc is a side effect; retention is the
product.

It formalizes the **gather** half of the gather→act cycle. Studies are durable
and citable: `/assess` and `/draft` may read a study as a source.

**State dir convention:** Always write to `.meta/`, creating it (and
subdirectories like `study/`) if needed. The study doc lives at
`.meta/study/<topic>.md` — but in the learner's **study-home**, which is
*not always the target*. **Study-home ≠ study-target:** the doc lives in the
learner's own workspace and the **source anchors point outward** at the target.
When the learner controls the target, home and target coincide (the common
case); when the target is shared/external/read-only, home is a separate repo.
Resolve this at Step 1.

**The artifact structure** is specified in `references/study-format.md` — read
it if you need the canonical shape. Scaffold from `templates/study-doc.md`.

---

## Step 1: Goal + target gate

Capture three things before reading anything:

- **Target** — the source set: repo URL, local path, a paper, our own
  code+test-logs. If it's missing, ask. Everything downstream is grounded in
  real source, so there must *be* a source.
- **Study-home** — *where the doc gets written.* Default to the target's own
  `.meta/study/` when the learner controls the target. But if the target is
  **shared, external, or read-only** (a take-home shared with reviewers, a
  company's OSS for interview prep, a paper, a vendored dep), the trail must not
  live there — prompt for / create a separate study home (a dedicated `study`
  project or personal workspace) and record a **`Target repo:`** line in the
  header (Step 3). Exemplar: `honcho-internals.md` lived in `~/Development/meta`,
  anchors pointing at the Honcho repo.
- **Goal** — free text: *why* we're learning ("interview prep for Plastic
  Labs," "defend the take-home Monday," "understand pgvector indexing"). The
  goal frames quiz difficulty and pacing.
- **Mastery targets** (optional) — the precise domains that must be understood
  by the end, a **minimum viable surface**. Seed them from an external brief if
  one is referenced (read it — e.g. a screening brief's "Final review" section
  is a literal target list), gather/suggest them with the learner, or leave them
  empty for open-ended general mastery. Record under `## Mastery Targets`.

If the goal implies a **deliverable** beyond knowledge in the learner's head,
offer to set up a **study product** (see `## Study Products` in the format ref):
a questions-for-interviewer list, a probe-answers sheet, a practical-advice
writeup. Pure-ingest studies ("this whitepaper is neat") skip it.

## Step 2: Stage 0 (conditional) — source-gathering

**Only if the topic has no pre-given source** (an abstract subject like
"financial instruments for low-income families"):

1. Propose candidate sources.
2. Vet them **with the learner** as authoritative — don't proceed on sources the
   learner hasn't blessed.
3. Record the vetted set as the source anchors.

Skip this step entirely when the source is already given (a repo, a paper, our
own code). Don't manufacture a source-gathering pass where the source is obvious.

## Step 3: Source anchors + stage map

Read enough of the source to lay out the study. Then write the doc **header**:

- What this is, in a sentence.
- **`Target repo:`** — include this line **only when study-home ≠ study-target**
  (Step 1): name the outward target the anchors point at, so a reader knows the
  source lives elsewhere.
- **Source anchors** — real file/dir paths or source refs, so every stage is
  grounded.
- A one-paragraph description of the loop (so a reader knows how to use the doc).
- The **goal**.
- `## Mastery Targets` / `## Study Products` sections if Step 1 produced them.

Then write the **stage map**: numbered stages, one-line scope each, plus a
pacing note. **Derive the stage count from the source** (Honcho was 7 stages;
a reference architecture was 10 layers) — propose it, let the learner adjust.

**Get the learner's sign-off on the stage breakdown before diving in.** The map
is the contract for what we're about to study.

## Step 4: The per-stage loop (the heart of the skill)

**Strictly one stage at a time.** Run this rhythm per stage:

1. **Write the stage** — to-the-metal, citing real `file`/`function`/`table`
   names, verified against source. Append it under the stage's heading.
2. **Learner reads and annotates INLINE** — their comments live next to the
   prose they react to. Wait for them.
3. **Comment on the notes** — affirm strengths *specifically*; correct
   misconceptions *precisely, with the mechanism*; name the **valuable misses**
   (a wrong answer that taught something worth the stumble).
4. **Craft a TARGETED quiz** — probe the soft spots the notes exposed and the
   mastery-target domains; *skip* what the learner clearly nailed. Post it as a
   `### Quiz` block at the end of that stage. **Do not pre-stage the quiz** — it
   must be informed by the notes that came back.
5. **Learner answers inline** — preserve their raw answers; the trail is part of
   the artifact's value.
6. **Score + log + unlock** — proceed to Step 5.

## Step 5: Score + log + unlock

After each quiz:

- Append a dated entry to the bottom `## Quiz Log`: the question, the learner's
  answer, a **score** (`✓` / `✓ partial` / `✗`, flagging any `✗` that's a
  **valuable miss**), and the correction/refinement *with mechanism*.
- Update the running **Revisit** weak-spots list. If a Revisit item proves
  load-bearing, **promote it to a mastery target** — forward-only: it raises the
  bar for remaining stages, it does not re-open an already-complete stage.
- Mark the stage done in the stage map, then **unlock the next stage** (back to
  Step 4).

## Step 6: Pacing + close

- **Pace to the learner.** One stage at a time, always. Respect "I'm hitting my
  ingestion limit" — stop cleanly; the doc resumes next session (`/hello`
  surfaces in-progress studies).
- **Completion is two orthogonal criteria:** *all stages studied* **and**
  *minimum viable surface covered*. A study **with** mastery targets stays open
  (and may grow new stages) until **both** clear. A study **without** targets is
  one-dimensional — done when stages are done.
- On completion, write a "study complete" marker in the stage map and
  **add/refresh the `study/index.md` entry** (scaffold from
  `templates/study-index.md`). For a two-dimensional study, the index status
  shows both subitems (*stages complete?* / *surface covered?*).
- The study doc is **durable reference** — not archived, not graduated. It lives
  on as a permanent learning artifact that assessments and designs may cite.

---

## Core principles (what makes it work — non-negotiable)

- **Read the actual source.** Grep/fetch real files; cite real symbols. Correct
  marketing and abstraction with ground truth.
- **Verify before you quiz or grade.** Confirm a mechanism in source before
  asserting it or building a question on it — never grade against a guess.
- **Quiz after the notes, targeted at weakness.** Redundant questions on
  mastered material waste the loop.
- **Inline annotation, learner's voice preserved.** Never paraphrase the
  learner's notes away.
- **Strictly one stage at a time — a feature, not a limitation.** Stages build
  on each other, and one-at-a-time blocks passive skimming.
- **Affirm + connect.** Tie new mechanisms back to the learner's own prior
  reasoning and adjacent knowledge — it cements retention and builds confidence.
