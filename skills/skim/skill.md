---
name: skim
description: Go from ignorance to vague familiarity across a whole name-dropping domain — "just deep enough to hurt." The breadth-first sibling to /study: point it at a domain you don't know (often just a name), and it researches the terms worth recognizing, teaches them in batched 1-2-paragraph lessons with a quiz per item, and leaves a durable one-line-each summary you re-skim before the room. Recognition, not reconstruction. Replaces "three hours on Google." Distinct from /study (deep, one system, reconstruct-under-pressure) and /refresh (re-warm what you already learned). Usually user-invoked; agent may suggest it when "make sure I recognize these next time" intent appears.
---

# Skim

The user typed `/skim <domain>` — enter breadth-first, recognition-level learning mode.

`/skim` is the **breadth-first sibling to `/study`**. Where `/study` goes to the
metal on **one** system and reconstructs its mechanism under pressure, `/skim`
sweeps a **whole landscape** and takes you from **ignorance to vague familiarity** —
enough to recognize a term, place it on the shelf, and say one true sentence about
it, but no deeper. It "goes just deep enough to hurt."

The motivating case: you hear "Hermes" and "OpenSpec" fly past in conversation, don't
recognize them, and want to make sure *that doesn't happen again*. You point `/skim`
at the domain from a place of ignorance, and come out able to hold your own.

**The durable output is a one-line-each summary** — a recognition sheet you re-skim
before you walk into the room. The lessons are the scaffold; the summary is the product.

**State dir convention:** Always write to `.meta/`, creating it (and `skim/`) if
needed. The skim doc lives at `.meta/skim/<topic>.md` — but in the learner's
**skim-home**, which is *not always the target*. **Skim-home ≠ skim-target:** the doc
lives in the learner's own workspace and the **source anchors point outward**. When
the source is shared/external/read-only, home is a separate repo. Resolve at Step 1
(carried from `/study` A1).

**The artifact structure** is specified in `references/skim-format.md`. Scaffold the
doc from `templates/skim-doc.md` and the index from `templates/skim-index.md`.

---

## Step 1: Goal + domain gate

Capture two things before researching anything:

- **Domain** — what we're skimming. Often just a name (`/skim AI evals`, `/skim
  common observability metrics`, `/skim major players in the Lithuanian political
  scene`). Unlike `/study`, there need not be a pre-given source — `/skim` will do the
  research to build the item set (Step 2). If the domain already ships as a list (an
  existing decoder ring), note it for ingest.
- **Goal** — free text: *why* we're skimming ("recognize these in conversation,"
  "scout which parts deserve a deep dive," "literacy before the meetup"). The goal
  frames how tight the recognition bar is.

Resolve **skim-home**: default to the target's own `.meta/skim/` when the learner
controls the target; if the source is shared/external/read-only, prompt for / create a
separate skim-home and record a `Target:` line in the header.

## Step 2: Research + build + sign off the item list

Assemble the candidate set — the terms worth recognizing in this domain.

- **If the domain already ships as a list**, ingest it as the starting set.
- **If it's just a name**, *do the web research to build it.* **This is the skill's
  core value — it replaces "spending three hours on Google."** The research is the
  point, not a preamble to it. Use web search/fetch; gather and vet sources as you go —
  they become the **source anchors** each lesson is grounded in.

Write the doc **header** (from `templates/skim-doc.md`): what this is, the goal, the
source anchors, a one-paragraph loop description. Then lay out the item list.

**Get the learner's sign-off on the list before teaching.** The list is the contract
for the surface. Everything starts unknown — there is **no "mark what you already
know" pass** (you're here from ignorance; such a pass would be all `???`). If the
learner already knows a few items, note it and move fast through those.

## Step 3: The batch loop (the heart of the skill)

Group the items into **batches of ~5 by affinity** (a memory-vendor batch, a protocol
batch — not arbitrary chunks), so the lessons cross-reference and placements land
against near-neighbors. *~5 is an order-of-magnitude default, not a rule — propose the
groups, let the learner adjust.* Then, per batch:

1. **Teach the batch** — **1–2 paragraphs per item**, **grounded in a real source,
   never written from priors.** The shallow depth does not excuse ungrounded teaching —
   a confident-wrong one-liner is the failure mode of a fake decoder ring, so verify.
   Cover **what it is, what it's like, how it differs** — but *not* to the metal.
2. **Learner reads and reacts.** Keep their voice; annotations/notes go in **bullet
   lists** (typing into IDE table cells is awkward — reserve tables for the summary).
3. **Quiz the batch** — one targeted question per item, posted **after** the
   paragraphs (never pre-staged). Forms: *identify* ("what's OpenSpec, one sentence?"),
   *place* ("where does philset sit relative to it?"), *distinguish confusables*
   ("Hermes model vs. Hermes Agent?"), *cold-recall a cluster* ("name three memory
   vendors"). **Never** "walk me through MCP's stateless core" — that's a `/study`
   stage.
4. **Learner answers inline** (bullets, raw answers preserved).
5. **Score + note + next batch** — score the active-recall answers, note anything
   shaky, move to the next batch of ~5.

## Step 4: Final exam + summary

Once every batch is done, write the **one-line-each summary** — the deliverable and
the final exam:

- One line per item: **what / like-what / how-different**, distilled.
- Mark each item `cold` / `fuzzy` / `known` based on how the quizzes went, **re-probing
  anything still shaky** before you mark it.
- The summary is a **table** (you fill it, so table-editing isn't on the learner).

`known` across the board is the aspiration; **`fuzzy` is an acceptable resting state**
— that's the *vague* in vague familiarity.

## Step 5: Close

- **Pace to the learner** — faster cadence than `/study`; a whole domain can close in
  a session or two. Respect "I'm hitting my limit" — stop cleanly; the doc resumes next
  session (`/hello` surfaces in-progress skims).
- **Completion** is one dimension: every item taught, quizzed, and carrying a summary
  line marked `cold`/`fuzzy`/`known` (or explicitly **parked** — an item not worth even
  recognizing, logged not silently dropped).
- **Offer to graduate** any load-bearing item to a `/study` — deciding *what deserves
  the deep dive* is a headline reason to skim. The item becomes a study target, anchors
  carry over. Forward-only.
- On completion, add/refresh the `skim/index.md` entry (scaffold from
  `templates/skim-index.md`). The skim doc is **durable reference** — not archived, not
  graduated. It lives on as the sheet you re-skim before the room (a `/refresh` target
  once that exists).

---

## Core principles (what makes it work — non-negotiable)

- **Start from ignorance.** No "what do you already know" gate — the domain is unknown
  by premise. The active-recall cost lives in the per-item quiz, not an upfront commit.
- **Research is the point.** Building the list for a bare-name domain is real web
  research — this is the "replaces three hours on Google" step, not a cursory pass.
- **Source-grounded, never from priors.** Shallow ≠ ungrounded. Every lesson cites a
  real source; verify before you teach or quiz. A confident-wrong recognition line is
  worse than no line.
- **Recognition, not reconstruction.** The bar is *what / like-what / how-different* —
  one true sentence + placement. Anything that needs the mechanism graduates to `/study`.
- **Batched, and quiz after the paragraphs.** ~5 related items per batch; the quiz is
  what keeps a skim from decaying into passive reading. Never pre-stage the quiz.
- **Lighter retention on purpose.** `/skim` optimizes coverage, not mastery. `fuzzy` is
  a fine exit — don't grind an item to `known` when recognition was the goal.
- **Learner's voice, in bullets.** Preserve raw notes and answers; reserve tables for
  the Claude-filled summary.
