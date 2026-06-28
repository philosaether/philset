---
Status: accepted
Date: 2026-06-28
Accepted: 2026-06-28
Amended: 2026-06-28
Amendments:
  - id: A1
    title: Study-home ≠ study-target (off-repo studies)
    date: 2026-06-28
    status: accepted
Assessment: (none — sourced from inbox/staged-study-skill.md, captured from a live session)
Supersedes: (none)
---

# /study — Staged Source-Grounded Learning — Desired State

A skill for **deeply learning a system that already exists** — an external
codebase, an architecture, a body of primary source, or *your own recent work* —
by reading the actual source and working through it in **stages** with a tight
write → annotate → comment → quiz → score loop. Produces a durable, shareable
study doc with retention built in.

Captured from a proven live session (`meta/.meta/honcho-internals.md`, a staged
study of the Honcho codebase before a CTO intake). This design reproduces that
rhythm as a repeatable skill.

---

## Where it sits among the skills

| Skill | Verb | Artifact |
|-------|------|----------|
| `/assess` | snapshot the state of **our** system to feed design | assessment doc |
| `/draft` | **design** something new | design doc |
| `/study` | **learn** something that already exists, rigorously, with retention | study doc |

`/study` is the only skill whose artifact is *for the learner's head*, not for
downstream tooling. The doc is a side effect; retention is the product.

**The gather→act cycle.** Any project proceeds in cycles of *gather information*
→ *act on information*. `/study` formalizes the gather phase the way `/assess`
and `/draft` formalize acting. Studies are first-class citizens: assessments and
designs may cite a study as a source.

## When to use

- **Onboarding** to an unfamiliar codebase or dependency.
- **Interview prep** — learn the target company's open-source system to the metal.
- **Primary-source mastery** — paper + reference implementation, well enough to
  reason *past* it, not just recite it.
- **Abstract-topic / research mastery** — a subject with no single canonical
  source (e.g. "common financial instruments available to low-income families").
  Requires a source-gathering pass first (see **Stage 0**).
- **Defending your own work** — re-internalize a system *you* built (recent
  decisions, test runs, tradeoffs) to speak authoritatively under questioning.
  *(This is the dogfood case: pl-takehome-technical, 2-day prep window. The
  "source" is our own code + test results; the loop is identical.)*

## The artifact

One study doc per topic. **Location: `.meta/study/<topic>.md`** (see Tradeoffs —
the proven examples lived flat in `.meta/`; we standardize into a `study/`
subdir to match `designs/`, `tracks/`, `assessments/`). Structure:

1. **Header** — what this is; **source anchors** (real file/dir paths or source
   refs, so every stage is grounded); a one-paragraph description of the loop;
   the **goal** (why we're learning — frames quiz difficulty and pacing).
2. **Stage map** — numbered stages, one-line scope each, + a pacing note.
   Carries inline status annotations as stages complete (`*(written below)*`,
   `*(studied 2026-06-20)*`).
3. **Stages** — each written **to-the-metal**, grounded in real
   `file` / `function` / `table` names. Read the source; don't summarize from
   memory or marketing.
4. **Per-stage `### Quiz` block** — added *after* the stage is studied and the
   learner has annotated, targeted at the soft spots the notes exposed.
5. **`## Quiz Log`** (bottom) — dated per-stage entries: question, the learner's
   answer (preserved verbatim — the trail is itself evidence of process), a
   score, the correction/refinement with mechanism, and a running **Revisit**
   weak-spots list.

The study doc may also carry two optional framing sections — **Mastery Targets**
(what to *understand*) and **Study Products** (what to *produce*). They're
orthogonal axes: scope vs. deliverable.

## Mastery Targets (optional `## Mastery Targets` section, near the doc head)

Where *general mastery* is the open-ended goal, **mastery targets** are the
precise domains that must be understood by the end — a **minimum viable
surface**. They scope the session.

- **Seeded** three ways, any combination:
  - From an **external brief** (e.g. `inbox/platform-screening-brief.md`, whose
    "Final review" section is a literal list of questions to be answered Monday).
  - **Gathered or suggested** by agent or learner at session start.
  - Left **empty** — general mastery only.
- **Live** — targets can be raised and **promoted mid-session** as gaps surface
  (a Revisit item that proves load-bearing becomes a target). Promotion is
  **forward-only**: it raises the bar for remaining stages; it does not re-open
  an already-complete stage for a follow-up quiz.
- **Load-bearing**, in two ways:
  - They **bias quiz targeting** — probe the target domains, not just the
    generic soft spots the notes expose.
  - They **gate completion** — see below; "surface covered" is one of two
    orthogonal completion criteria.

## Study Products (optional `## Study Products` section)

The deliverable(s) a study produces *beyond* retention. Generalizes the original
`questions-for-X.md` idea — that was one instance, over-fit to intake-interview
prep. The product depends on what the study is *for*:

| Study goal | Product |
|------------|---------|
| Intake interview | Questions **for** the interviewer (route persistent unknowns here) |
| Thesis defense / defend the take-home (**dogfood**) | **Answers to expected probes** — a sheet the learner reviews right before the meeting |
| "Financial instruments for low-income families" | Practical advice the learner can give those families |
| "This whitepaper is neat, let's ingest it" | **None** — knowledge is the only product |

A product is optional. When present, it's a companion file (e.g.
`study/<topic>.products.md`, or `questions-for-<X>.md` for the interview case) so
it can be reviewed standalone. The agent offers a product when the goal implies a
deliverable; pure-ingest studies skip it.

## The per-stage loop (the heart of the skill)

This is the rhythm. **Strictly one stage at a time** (see Stage 0 for the
source-gathering pre-pass on sourceless topics).

1. **Claude writes the stage** — to-the-metal, citing real symbols, verified
   against source.
2. **Learner reads and annotates INLINE** — comments live next to the prose
   they react to, not in a separate block.
3. **Claude comments on the notes** — affirm strengths *specifically*; correct
   misconceptions *precisely, with the mechanism*; name the **valuable misses**
   (a wrong answer that taught something worth the stumble).
4. **Claude crafts a TARGETED quiz** — probing the soft spots the notes exposed,
   *not* what the learner clearly nailed. Posted as a `### Quiz` block at the end
   of that stage. **Do not pre-stage the quiz** — it must be informed by the
   notes.
5. **Learner answers inline** — raw answers preserved.
6. **Claude scores + logs** to the Quiz Log, updates Revisit, then **unlocks the
   next stage.**

## Core principles (what made it work — non-negotiable)

- **Read the actual source.** Fetch/grep real files; cite `file`/`function`/
  `table` names. Correct marketing/abstraction with ground truth.
- **Verify before you quiz or grade.** Confirm a mechanism in source before
  asserting it or building a question on it — never grade against a guess.
- **Quiz after the notes, targeted at weakness.** Redundant questions on
  mastered material waste the loop.
- **Scoring vocabulary:** `✓` / `✓ partial` / `✗`, and explicitly flag a `✗`
  that is a **valuable miss**.
- **Inline annotation, learner's voice preserved.** Never paraphrase the
  learner's notes away — the raw trail is part of the artifact's value.
- **Strictly one stage at a time — a feature, not a limitation.** No writing
  ahead. Each stage builds on concepts the previous one established, so they
  must be studied in order; and one-at-a-time prevents passive scanning — you
  can't switch your brain off and skim a wall of pre-written text. Respect "I'm
  hitting my ingestion limit" — stop cleanly.
- **Revisit list** captures deferred deep-dives so they aren't lost.
- **Affirm + connect.** Tie new mechanisms back to the learner's own prior
  reasoning and to adjacent knowledge — cements retention, builds confidence.

## Skill shape (the `skill.md` steps)

Following philset's numbered-Step convention:

- **Step 1 — Goal + target gate.** Capture the target (repo URL / path / source
  set) and the goal (free text). Capture or offer to gather **mastery targets**;
  if an external brief is referenced, read it and seed the targets. If the goal
  implies a deliverable, offer to set up a **study product** (e.g. a
  questions-for-interviewer list, a probe-answers sheet). If target is missing, ask.
- **Step 2 — Stage 0 (conditional): source-gathering.** If the topic has no
  pre-given source (an abstract subject), *first* propose candidate sources, vet
  them **with the learner** as authoritative, and record them as the source
  anchors. Skip this step when the source is already given (a repo, our own code).
- **Step 3 — Source anchors + stage map.** Read enough of the source to lay out
  real anchors and a numbered stage map (count derived from the source, proposed
  for the learner to adjust) with a pacing note. Write the header. Get the
  learner's sign-off on the stage breakdown before diving in.
- **Step 4 — The per-stage loop.** Run the 6-step rhythm above, strictly one
  stage at a time. This is the bulk of the skill.
- **Step 5 — Score + log + unlock.** After each quiz, write the scored Quiz Log
  entry, update Revisit (promote any item to a mastery target if it proves
  load-bearing), unlock the next stage.
- **Step 6 — Pacing + close.** Respect ingestion limits; mark the stage map as
  stages complete. **Completion is two orthogonal criteria:** *all stages
  studied* **and** *minimum viable surface covered*. A study with mastery targets
  stays open (and may grow new stages) until **both** clear; a study without
  targets is one-dimensional (stages only). On completion, write a "study
  complete" marker and add/refresh the `study/index.md` entry. The doc is durable
  reference — **not** archived or graduated; it lives on as a permanent learning
  artifact that assessments and designs may cite.

## Skill integrations & discoverability (in scope)

- **`study/index.md`** — completed and in-progress studies get an index entry
  (mirrors `designs/index.md`): topic, status, date, one-line summary. The
  **status** column shows completion; for two-dimensional studies (those with
  mastery targets) "Completed" expands into subitems — *stages complete?* and
  *surface covered?* — so the index reflects both criteria at a glance. The
  `study/` dir + index is the discovery surface; assessments and designs cite
  studies from here.
- **`/hello` surfacing** — study docs carry a status marker (in-progress vs.
  complete). `/hello` surfaces in-progress studies the way it surfaces active
  riffs: *"`.meta/study/honcho.md` — 4 of 7 stages studied."* Small `/hello`
  Step 5 touch.
- **`/assess` ← studies** — `/assess` Step 2 (Explore) adds "check `study/` for
  relevant studies" to its gather checklist. A study is prior research; an
  assessment may cite it. *(This is the act half consuming the gather half.)*
- **`/draft` ← studies** — `/draft` Step 1 (Gather context) likewise checks
  `study/` alongside `assessments/` and `designs/index.md`, and may cite a study.

These three integration touches make the gather→act cycle real rather than
asserted; all are small and **included in this branch**.

## Tradeoffs

- **Name: `/study` vs `/learn` vs `/deep-study`.** Choosing `/study`. It's the
  proposal's working name, it's the shortest, and "learn" is overloaded (ML
  connotation). `/deep-study` is redundant — the depth is the point. *Revisit if*
  it collides with a future lighter-weight "skim" skill, where `/study` vs
  `/skim` would be the natural pair.
  - Plus, it's conversational. "Let's /study that codebase rq, I want to know X Y and Z"
- **Doc location: `study/` subdir vs. flat `.meta/<topic>-internals.md`.**
  Choosing `.meta/study/<topic>.md`. The proven examples were flat (and the
  `-internals` suffix was ad-hoc), but every other multi-instance philset
  artifact lives in a typed subdir (`designs/`, `tracks/`, `assessments/`).
  Consistency wins; a `study/` dir also makes "what am I studying?" greppable.
  *Revisit if* studies turn out to be near-always singular per repo (then flat
  is fine).
- **Quiz-log placement: per-stage inline `### Quiz` + bottom `## Quiz Log` vs.
  a single bottom log.** Keeping the dual structure — it's what the proven docs
  used. The inline block is where the learner *answers in the moment*; the
  bottom log is the *scored, dated, durable* record with Revisit. They serve
  different moments (active recall vs. spaced review). *Revisit if* the
  duplication feels redundant in practice.
- **Voice: generic "the learner" vs. "Phil".** Writing the skill in generic
  voice ("the learner reads and annotates"). The proven docs are Phil-specific
  because they were artifacts, not skills. This ties to the chunk-3 onboarding/
  voice split — `/study` should not hardcode a single user. *Revisit when* chunk
  3 settles the per-developer vs. shared-team voice convention.
- **Companion questions-log: part of the skill vs. separate concern.** Folding
  it in as an *optional limb*, offered only when the goal names an audience.
  Keeps the common case (pure onboarding) clean while supporting the
  interview-prep case that motivated it. *Revisit if* it wants to become its own
  `/questions` skill.
- **Completion bar: orthogonal vs. one overrides the other.** Considered letting
  "surface covered" *override* stage count (finish early once targets are met).
  Rejected: stages and targets answer different questions — stages = "did I walk
  the whole system," targets = "can I clear the bar I'm here for." A study with
  targets is done only when **both** clear (orthogonal AND); without targets it's
  one-dimensional (stages only). *Revisit if* the dual bar feels heavy for small
  studies in practice.

## Resolved this iteration

- **`/hello` integration** → in scope this branch (small Step 5 touch).
- **`study/index.md`** → yes — studies get an index; assessments/designs cite
  them. `.meta/study/` convention confirmed over separate-repo studies.
- **Stage count** → derived from source, proposed, learner adjusts.
- **One-at-a-time** → strict, no batching — it's a selling point (stages build
  on each other; blocks passive scanning).
- **Dogfood / source-agnostic** → confirmed; abstract topics get **Stage 0**
  source-gathering + vetting (the financial-instruments study is queued real work).
- **Mastery Targets** → a `## Mastery Targets` *section* in the study doc.
- **`questions-for-X` → generalized to Study Products** → an optional, goal-shaped
  deliverable (interviewer-questions / probe-answers / advice / none). The
  interview questions-log is one instance.
- **Completion** → two orthogonal criteria (stages complete **AND** surface
  covered); one-dimensional when no targets.
- **Index format** → status column shows "Completed"; two-dimensional studies get
  stages/surface subitems.
- **Target promotion** → forward-only (raises the bar for remaining stages; never
  re-opens a complete stage).

## Open Questions

*(none currently — design is converged; flag anything on next read)*

## Out of Scope

- **Spaced-repetition scheduling / SRS mechanics** (Anki-style intervals). The
  Quiz Log + Revisit list is a manual review aid, not an automated scheduler.
- **Auto-generating the study from source** without the learner in the loop.
  The annotation/quiz loop *is* the skill; a one-shot summary defeats it.
- **Multi-learner / shared study sessions.** Single learner per doc for now.
- **Rewriting the proven artifacts** (honcho-internals.md et al.) — they stay as
  reference exemplars in `meta/.meta/`.

## Amendments

### A1: Study-home ≠ study-target (off-repo studies) (2026-06-28)

**Status:** accepted
**Trigger:** Dogfooding `/study` on `pl-takehome-technical` — a repo *shared with
take-home reviewers*. Writing the study doc into its `.meta/study/` would expose
the learning/quiz trail to the people grading the work.

**Refined reasoning:** The artifact section ("Location: `.meta/study/<topic>.md`")
and Step 3 implicitly assume the study doc lives in the *target's* `.meta/`. That
holds **only when the learner owns/controls the target.** The general rule is
**study-home ≠ study-target**: the study doc lives in the *learner's own
workspace* `.meta/study/`, and the **source anchors point outward** at the
target. When the learner controls the target, home and target coincide (the
common case). When the target is **shared, external, or read-only** (a take-home
shared with reviewers, a company's OSS for interview prep, a paper, a vendored
dependency), home is a **separate repo** — a dedicated `study` project or a
personal workspace. This is not new behavior: the proven exemplar
`honcho-internals.md` already lived in `~/Development/meta`, *not* the Honcho
repo, with anchors pointing at `github.com/plastic-labs/honcho`. The skill should
**resolve study-home at Step 1**: default to the target's `.meta/` when the
learner controls it; otherwise prompt for / create a separate study home and
record a "Target repo" line in the header above the source anchors.

**Unchanged:** The per-stage loop, the two orthogonal axes (Mastery Targets /
Study Products), the completion model, `study/index.md`, the `/hello` `/assess`
`/draft` integrations, and every skill Step except the Step-1/Step-3
study-home-resolution clarification above. Source-anchor grounding is *more*
load-bearing now, not less.

**Supersedes:** Nothing. Additive — clarifies where `.meta/study/` resides when
the learner doesn't own the target.
