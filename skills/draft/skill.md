---
name: draft
description: Create a working design document for collaborative iteration. Use when scoping a feature, system change, or workflow — the doc is the conversation artifact, not a summary.
---

# Draft

Create a working design document. The user typed `/draft <topic>` — produce
the first iteration of a design doc for collaborative iteration. The design
session ends when the doc reflects shared understanding.

**Implementation gate:** Do not begin implementation from this skill.
`/draft` produces a design doc — `/ship` authorizes building. When the
design is satisfactory, wait for the user to invoke `/ship` rather than
proceeding to implementation.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 0: Branch check

Before anything else, check the current git branch:

- **On main/master**: Nudge the user — "I noticed we're on main. Should I
  create a feature branch for this?" Not blocking; if they say no, proceed.
- **On a branch that doesn't match the topic**: Surface the mismatch —
  "You're drafting X, but we're on branch feature/Y. Continue here, or
  switch?" Again, not blocking — just awareness.
- **On a matching feature branch**: Proceed silently.

## Step 0.5: Scope check

Before gathering context, check whether the request has enough specificity
to produce a useful first draft. If the topic is genuinely ambiguous —
not just terse — ask 1-2 scoping questions before proceeding.

Rules:
- Maximum 2 questions, asked together
- Skip entirely when the user provides constraints, references an
  assessment, or the conversation already has context
- Frame as "I want to make sure I scope this right" not an intake form

## Step 1: Gather context

- Check `assessments/` in the state dir for a recent assessment matching this topic
- Review the conversation for scope, constraints, and decisions so far
- Check `designs/index.md` for related existing designs
- If existing designs will likely be superseded by this work, note them
- Note tradeoffs encountered so far — alternatives discussed in
  conversation, competing approaches in the assessment, or options you
  identify yourself. These feed the Tradeoffs section.

## Step 2: Write the draft

Create `designs/<topic-slug>.md` in the state dir:

```markdown
---
Status: draft
Date: <today>
Assessment: <link to assessment, if one exists>
Likely-supersedes: <link to prior design, if applicable>
---

# <Topic> — Desired State

<1-3 sentence summary of what we're building and why.>

---

## <Sections as appropriate to the topic>

Common section patterns:
- Data model changes (schema, fields, tables)
- UI changes (views, flows, components)
- Engine/logic changes (behavior, rules)
- API changes (endpoints, contracts)

Keep it specific enough to implement from. Name files, endpoints, fields.

## Tradeoffs

Alternatives considered — both decided and undecided. Focus on forks
where the decision could plausibly go either way — not every micro-choice,
but the ones a reviewer or future reader would wonder about.

For each tradeoff:
- What the alternative was
- Why it was rejected (or chosen)
- What would change the calculus (conditions under which we'd revisit)

## Open Questions

Unresolved questions. Answered during iteration or flagged for the user.

## Out of Scope

Explicitly excluded. Prevents scope creep.
```

Adapt the body structure to the topic. A data model design looks different
from a UI design. Use judgment.

The Tradeoffs section captures design forks — alternatives that were
seriously considered. Include tradeoffs that surfaced in conversation,
in the assessment, or from your own analysis. Don't pad — if there were
no meaningful alternatives, a short section or empty section is fine.

If an ambiguous choice will appear in Open Questions ("Should we use X
or Y?"), it should also be a Tradeoffs item — lay out the alternatives
and your analysis, even if the decision isn't made yet.

## Step 3: Add to index

Add the new doc to `designs/index.md` with status "draft".
If `index.md` doesn't exist yet, create it with a header and table format
(see `references/designs-index.md` in the tree root `.meta/` for format).

## Step 4: Present

Show the user the draft. This is the start of the iteration, not the end.
Expect the user to:
- Edit the file directly in their IDE and ask you to re-read it
- Reply with corrections or redirections in the CLI
- Expand or narrow the scope

Iterate until the user is satisfied, then wait for `/ship`.

Do not begin implementation until the user invokes `/ship` or explicitly
asks you to build (e.g., "just build it", "skip /ship and implement").
If the user signals satisfaction with the design but doesn't invoke
`/ship`, prompt: "Ready to /ship this?" The gate exists to prevent
accidental skips, not to block deliberate ones.
