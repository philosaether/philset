---
Status: accepted
Date: 2026-07-13
Accepted: 2026-07-13
Assessment: ~/Development/.meta/assessments/ai-ecosystem-integration.md (§1.4 Decoder Ring — the proving target; §2.2.4 "study-like loops")
Supersedes: (none)
Sibling-of: designs/study-skill.md (study-skill.md:226 foresaw the /study–/skim pair)
Implemented: 2026-07-13 (feature/skim-skill)
Divergences: none — all design elements built as specified (verified in /review)
Deferred: none
---

# /skim — Recognition-Level Breadth Learning — Desired State

A study-family sibling that **goes just deep enough to hurt**: point it at a domain
you *don't* know yet and it walks you from **ignorance to vague familiarity** across
the whole landscape — enough to recognize a term, place it on the shelf, and say one
true sentence about it, but no deeper. Where `/study` goes to the metal on one
system, `/skim` sweeps a whole landscape fast. The durable output is a
**one-line-each summary** — a recognition sheet you re-skim before you walk into the
room.

Sourced from Phil's own framing (`ai-ecosystem-integration.md:125`): *"/study goes
to the metal; /skim goes just deep enough to hurt. I'd use it on the whole Decoder
Ring list so I recognize the names next time I hear them in conversation."* The
skill was motivated by hearing "Hermes" and "OpenSpec" in conversation and **not
recognizing them** — *"let's make sure that doesn't happen again."* The proving
target is that Decoder Ring (§1.4, ~35 terms).

---

## Where it sits among the skills

| Skill | Verb | Depth | Artifact |
|-------|------|-------|----------|
| `/assess` | snapshot **our** system to feed design | — | assessment doc |
| `/draft` | **design** something new | — | design doc |
| `/study` | **learn** one system rigorously, reconstruct under pressure | to-the-metal, one stage at a time | study doc |
| `/skim` | **recognize** a whole landscape — place it, one true sentence | just deep enough to hurt, batched | one-line-each summary |
| `/refresh` *(Tier 2, unbuilt)* | **re-warm** something you already learned | shallow re-activation | (reuses a study/skim doc) |

`/study` and `/skim` are the **depth/breadth pair** over the same gather-phase verb:

- `/study` — **depth-first.** One system, one stage at a time, reconstruct the
  mechanism under pressure. Strictly no batching (batching *is* the failure mode it
  guards against).
- `/skim` — **breadth-first.** A whole domain, batched, start-from-ignorance, exit at
  vague familiarity. The per-item quiz keeps it from decaying into passive scanning —
  that active-recall cost is what "hurt" means.

`/skim` is *not* `/refresh`. `/refresh` re-activates something you already learned;
`/skim` is **first contact** on something you don't know and won't (yet) go deep on.
Different axis. See Tradeoffs.

## When to use

- **"Make sure I recognize these next time."** The founding case: terms fly past in
  conversation (Hermes, OpenSpec, mem0/Zep/Letta, METR time horizons, PUWTPD…) and
  you want to not-be-lost next time. You start ignorant on purpose.
- **Scout before a deep dive.** You have a domain but not the time to `/study` it —
  `/skim` surfaces *which* entries actually earn the deep session and which you just
  need to place. This is a primary use, not an afterthought (see Escalation).
- **A domain that's just a name.** `/skim AI evals`, `/skim common observability
  metrics`, `/skim major players in the Lithuanian political scene` — no pre-given
  list; `/skim` *researches* the candidate set from the domain, then teaches it.
  **This is the skill's core value: it replaces "spending three hours on Google"** —
  the research is the point, not a preamble to it.
- **Deliberately-shallow canon.** A body you need literacy in but not mastery
  ("evals demote to /skim-literacy" — `ai-ecosystem-integration.md:26`).
- **Pre-conversation cram.** Re-skim a finished summary right before a meetup or call
  where the vocabulary will fly.

## The guiding principle — "just deep enough to hurt"

Three commitments, all load-bearing:

- **Start from ignorance.** By design you point `/skim` at something you *don't*
  know. There's no "mark what you already know" gate up front — almost everything is
  unknown; that's *why* you're skimming.
- **Exit at vague familiarity.** The target mastery is one crisp sentence that
  answers: **what is this thing? what is it similar to? how is it different?** That's
  the level you come *out* with — enough to recognize and place, not to reconstruct.
  Deeper is `/study`'s job.
- **"…to hurt" = active recall.** During the loop you get taught a short paragraph,
  then **quizzed** — you commit an answer before seeing the correction. The quiz is
  the cost that makes it stick. A wall of one-liners you nod along to is exactly what
  this skill refuses to be. Retention is deliberately *lighter* than `/study` — the
  point is coverage, not mastery.

## The artifact

One skim doc per domain. **Location: `.meta/skim/<topic>.md`** (mirrors
`.meta/study/<topic>.md`; **skim-home ≠ skim-target** carries over from study-skill
A1 — the doc lives in the learner's workspace, source anchors point outward). Three
parts:

1. **Header** — what this is; the **goal** (why we're skimming — frames how tight the
   bar is); **source anchors** (refs the teaching is grounded in — may be *gathered*
   for an abstract domain, see the loop); a one-paragraph description of the loop.
2. **The batches** (the learning trail) — items grouped ~5 at a time by affinity,
   each taught in **1–2 paragraphs**, followed by that batch's quiz and the learner's
   answers + scores. This is the durable trail (like `/study`'s stages), kept in the
   doc.
3. **The summary** (the deliverable + final exam) — **one line per item**, produced
   at the *end*, each carrying a status (`cold` / `fuzzy` / `known`). This is what you
   re-skim before the room:

   | Term | One-line summary (what / like-what / how-different) | Status |
   |------|------------------------------------------------------|--------|
   | OpenSpec | Fission-AI's spec-driven-dev CLI; closest public analog to philset's draft→ship→supersede | `known` |
   | Zep/Graphiti | memory vendor — the *bi-temporal knowledge graph* one, vs. mem0's vector default | `fuzzy` |

   The summary table is filled by Claude (as the final exam), so editing it isn't on
   the learner. **Everywhere the learner types — recognition answers, notes — uses
   bullet lists, not tables** (typing into a table cell in an IDE is awkward).

Deliberately lighter than a study doc: **no per-stage prose to the metal, no Mastery
Targets / Study Products axes.** One completion dimension (see below).

## The loop — breadth-first, batched

1. **Research + build the item list.** From the domain, assemble the candidate set —
   the terms worth recognizing. If the domain already ships as a list (the Decoder
   Ring), ingest it; if it's just a name, **do the web research to build it** — this
   is the "replaces three hours on Google" step, real research, not a cursory pass.
   Gather/vet sources as you go (they become the anchors each lesson is grounded in).
   **Get sign-off on the list** — it's the contract for the surface. Everything starts
   unknown.
2. **Group into batches of ~5** related items (affinity, not arbitrary chunks — a
   memory-vendor batch, a protocol batch), so the paragraphs cross-reference and the
   placements land against near-neighbors. *~5 is an order-of-magnitude default, not a
   rule* — Claude proposes the groups, the learner adjusts.
3. **Teach the batch** — 1–2 paragraphs per item, **grounded in a real source, never
   written from priors** (the shallow depth doesn't excuse ungrounded teaching — a
   confident-wrong one-liner is the failure mode of a fake decoder ring). What it is,
   what it's like, how it differs — but *not* to the metal.
4. **Quiz the batch** — one question per item, targeted, posted after the paragraphs
   (not pre-staged). Forms: *identify* ("what's OpenSpec, one sentence?"), *place*
   ("where does philset sit relative to it?"), *distinguish confusables* ("Hermes
   model vs. Hermes Agent?"), *cold-recall a cluster* ("name three memory vendors").
   Never "walk me through MCP's stateless core" — that's a `/study` stage.
5. **Score + next batch** — score the answers (active recall), note anything shaky,
   move to the next batch of ~5.
6. **Final exam + summary** — once the batches are done, Claude writes the
   **one-line-each summary** and marks each item `cold` / `fuzzy` / `known` based on
   how the quizzes went (re-probing anything still shaky). That marked summary is the
   deliverable.

The result is *a loop very like `/study`* — write → learner reads → quiz → score —
but **less depth, faster speed, lighter expected retention.**

## Completion — one dimension

Done when **every item has been taught, quizzed, and carries a summary line** marked
`cold` / `fuzzy` / `known` (or explicitly **parked** — an item the learner decides
isn't worth even recognizing, logged not silently dropped). One dimension, unlike
`/study`'s two orthogonal criteria — there are no "stages," only the surface, and the
bar is uniform: recognize + place + one true sentence. `known` across the board is the
aspiration; `fuzzy` is an acceptable resting state for a skim (that's the *vague* in
vague familiarity).

On completion: add/refresh the `skim/index.md` entry. Like a study doc, a skim is
**durable reference** — not archived, not graduated. It's the thing you re-skim before
the room (a `/refresh` target once that exists).

## Escalation — skim → study (a primary use, not an afterthought)

Deciding **what deserves a deep dive** is one of the two headline reasons to skim.
A `/skim` item that proves load-bearing — you keep needing it deeper than one
sentence — **graduates to a `/study`**: the item becomes a study target, anchors
carry over. `/skim` is the scout; `/study` is the expedition. Forward-only, same
spirit as `/study`'s mastery-target promotion.

## Skill shape (the `skill.md` steps)

Following philset's numbered-Step convention (leaner than `/study`'s):

- **Step 1 — Goal + domain gate.** Capture the domain and the goal (free text; frames
  how tight the bar is). Resolve **skim-home** (default the target's `.meta/skim/`;
  separate workspace if the source is shared/external/read-only — study A1 carried
  over).
- **Step 2 — Build + sign off the item list.** Ingest an existing list or *generate*
  candidates from the domain (gather/vet light sources for an abstract domain). Get
  the learner's sign-off on the set. Everything starts unknown.
- **Step 3 — The batch loop.** Group ~5 related items; teach 1–2 paragraphs each
  (verified, not to the metal); quiz one question per item after the paragraphs; score;
  next batch. This is the bulk of the skill.
- **Step 4 — Final exam + summary.** Write the one-line-each summary, mark each item
  `cold`/`fuzzy`/`known` (re-probe the shaky ones). This is the deliverable.
- **Step 5 — Close.** Respect ingestion limits (faster cadence than `/study`; a whole
  domain can close in a session or two). Refresh `skim/index.md`. Offer to graduate
  any load-bearing item to a `/study`. Durable, not graduated.

## Skill integrations & discoverability (in scope)

- **`skim/index.md`** — skims get an index entry (mirrors `study/index.md`): topic,
  status, date, one-line summary + item count.
- **`/hello` surfacing** — in-progress skims surface like in-progress studies/riffs:
  *"`.meta/skim/ai-ecosystem.md` — 22 of 35 items covered."* Small `/hello` Step 5 touch.
- **`/assess` ← skims** and **`/draft` ← skims** — both already check `study/`; add
  `skim/` to the same gather checklist. A skim is lighter prior research; still
  citable. *(This proving skim literally feeds `/draft` sessions like this one.)*

## Tradeoffs

- **Batched vs. strictly one-at-a-time.** `/study` forbids batching — stages build on
  each other and one-at-a-time blocks passive scanning. `/skim` **embraces** batching
  (~5 related items): breadth is the goal, items are largely independent, and the
  per-item quiz keeps it active. This is the central design fork; getting it wrong in
  either direction collapses `/skim` into `/study` or into passive reading. *Revisit
  if* batches turn out to need ordering.
- **No upfront recognition-commit pass.** Considered (and cut) a `/study`-ish "mark
  what you already know" gate before teaching. Cut because `/skim` starts from
  *ignorance* by definition — the pass would be all `???`. The active-recall cost
  moves to the per-item quiz instead. *Revisit if* partial-knowledge domains become
  common enough that a fast "skip what you know" pass earns its keep.
- **One line as *output*, paragraphs as *input*.** The teaching is 1–2 paragraphs per
  item; the one-liner is the *distilled result* produced at the end, not the material
  you learn from. Learning from bare one-liners was the rejected alternative (that's
  passive reading). *Revisit if* the paragraph tier feels too heavy for pure
  name-recognition domains.
- **Bullets for typing, table for the summary.** The learner types answers/notes as
  **bullet lists** (typing into IDE table cells is awkward); the final summary is a
  table because *Claude* fills it. *Revisit if* even the summary reads better as a
  list.
- **Recognition bar vs. mechanism bar.** Bar = "what / like-what / how-different," not
  "reconstruct the mechanism." *Revisit if* users routinely want a middle tier (then
  that's a third skill, not a widened `/skim`).
- **Own `skim/index.md` vs. sharing `study/index.md`.** Own index now for symmetry;
  a combined "learning" surface is plausible once `/refresh` lands. (Open Question.)
- **No Skim Product.** Considered a `/study`-style Study Product limb; cut — the
  summary *is* the product. *Revisit if* a downstream deliverable wants its own file.
- **Name: `/skim`.** Settled — the roadmap item, Phil's framing, and study-skill.md:226
  all name the `/study`–`/skim` pair. Conversational and self-explanatory.

## Resolved this iteration (2026-07-13)

- **Start from ignorance** → no upfront cold/fuzzy/known commit; the domain is
  unknown by premise.
- **Loop shape** → `/study`-like (teach → quiz → score) but batched ~5, 1–2 paragraphs
  per item, faster, lighter retention.
- **One-liner summary** → moved to the **end** as deliverable + final exam; status
  marked there.
- **Exit bar** → "vague familiarity": what / like-what / how-different.
- **Ergonomics** → bullets where the learner types; table only for the Claude-filled
  summary.
- **Scout function** → "which items deserve a deep study" elevated to a headline use.
- **Separate index + `.meta/skim/` subdir** → confirmed. *skim is to study what riff
  is to draft* — its own directory + index. Revisit a combined learning surface after
  `/refresh` lands.
- **Batch size** → Claude proposes affinity groups, learner adjusts; ~5 is an
  order-of-magnitude default, not a rule.
- **Web research is the core** → building the list for a bare-name domain is
  substantial research ("replaces three hours on Google"), and **every lesson stays
  source-grounded, never from priors.**
- **Re-skim** → `/refresh`'s job, not `/skim`'s.

## Open Questions

*(none — design converged 2026-07-13; flag anything on next read)*

## Out of Scope

- **Deep mechanism / reconstruct-under-pressure.** That's `/study`. A load-bearing
  item *graduates* rather than deepening in place.
- **SRS / spaced-repetition scheduling.** The doc is a manual aid, not a scheduler.
- **Guaranteed retention.** `/skim` optimizes coverage; `fuzzy` is an acceptable exit.
- **`/refresh`'s re-warm-what-you-already-knew.** Adjacent, deliberately separate skill.
- **Multi-learner shared skims.** Single learner per doc for now (carried from `/study`).
