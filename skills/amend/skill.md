---
name: amend
description: Make a scoped addition to an accepted design without superseding it. Use when an accepted design's reasoning needs updating but its decision and structure still stand. Agent-invoked when amendment intent is recognized.
---

# Amend

The user typed `/amend <design>`, or you recognized amendment intent in
conversation ("this updates our pricing assumption but doesn't change the
design"). Fills the gap between editing a draft and superseding an accepted
design: **the design's decision and structure stand; only supporting
reasoning shifts.**

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 0: Is this an amendment?

Use the decision rule before writing anything:

- **decisions.md line** — a choice was made; no reader of the *design* needs
  it inline. Not an amendment — just log it.
- **amend** — the design's decision/structure holds, only supporting
  reasoning shifts, **and a future reader of the design would be misled
  without it.** This skill.
- **supersede** (`/draft` v2 → `/ship`) — the decision itself changes, or
  the design already carries 3+ amendments. Stop; start a v2 draft instead.

## Step 1: Identify the design

- If the user names a doc (`/amend pricing`), use it.
- Otherwise infer from conversation; if ambiguous, ask.
- The target must be an **accepted** design in `designs/`. If it's still a
  draft, just edit it directly — no amendment needed.

## Step 2: Pick the mode

Let the substance decide — don't impose ceremony:

- **Settled** — the change was already decided in conversation ("that'll fix
  the edge case, /amend and ship"). Write the amendment as **`accepted`**
  directly. No annotation loop. This is the common, reactive case.
- **Iterating** — the amendment itself needs design work. Write it as
  **`proposed`** and enter the inline-annotation loop (same as `/draft`).

## Step 3: Write the amendment

Leave the original body and `Status: accepted` **untouched**. Append (or
extend) an `## Amendments` section at the end of the doc. Add an entry:

```markdown
## Amendments

### A<n>: <title> (<date>)

**Status:** accepted | proposed
**Trigger:** <new work/info that prompted it — link the source design/assessment>
**Refined reasoning:** <written as a layer on top of the original; reference
original sections by number ("§4 ceiling holds, but…") — not a rewrite>
**Unchanged:** <explicit list of what this does NOT touch — the blast radius>
**Supersedes:** <what in the original this replaces, or "Nothing. Additive.">
```

Number entries `A1`, `A2`, … like commit hashes — never reused. A rejected
`A2` stays `A2`; the next is `A3`.

Update the frontmatter:

```markdown
---
Status: accepted
Amended: <date>
Amendments:
  - id: A1
    title: <title>
    date: <date>
    status: accepted
---
```

## Step 4: Record it

- Append a one-line entry to `decisions.md`: that the design was **amended**
  (not superseded), with the gist.
- Update `designs/index.md`: add an `amended <date>` marker to the doc's row
  so the extension is visible without opening the file.

## Step 5: Close

- **Settled mode:** the amendment is `accepted` — implementation can begin
  immediately (the user likely said "/amend and ship").
- **Iterating mode:** present the proposed amendment and wait. "accept A<n>"
  flips it to `accepted`; "reject A<n>" flips it to `rejected` (the entry
  stays as a record of the decision not to proceed).

## Scope guard

If the amendment runs past ~1 page of changes, it's no longer a refinement —
nudge toward a `/draft` v2 that incorporates it. Same if the doc would reach
3+ amendments: ship a v2 instead of patching further.
