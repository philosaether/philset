---
Status: accepted
Date: 2026-05-01
Accepted: 2026-05-01
Assessment: assessments/no-build-without-ship.md
---

# No-Build-Without-Ship Guard — Desired State

Prevent agents from skipping `/draft` or `/ship` and jumping straight to
implementation. Add behavioral constraints to `/assess` and `/draft` that
gate implementation behind an explicit `/ship` invocation or unambiguous
user override.

---

## Changes to `/assess` (`skills/assess/skill.md`)

**Framing note** — add to the end of Step 4 (Present), after the existing
closing paragraph:

> Do not proceed to implementation after presenting the assessment. The
> assessment informs design work — it is not a green light to build. If the
> user's response is ambiguous (e.g., "looks good, let's do it"), clarify
> whether they mean "move to /draft" or "start building." An explicit
> "just build it" overrides this constraint.

**Why here:** Step 4 is where the agent composes its response to the user
and decides what to do next. This is the decision point where the wrong
interpretation leads to skipping `/draft`.

## Changes to `/draft` (`skills/draft/skill.md`)

**Two changes:**

### 1. Framing note — add to the skill description block

After the line `"The design session ends when the doc reflects shared
understanding."`, add:

> **Implementation gate:** Do not begin implementation from this skill.
> `/draft` produces a design doc — `/ship` authorizes building. If the
> user's intent is ambiguous, ask whether they want to iterate further
> or move to `/ship`.

**Why here:** This sets the frame early for interpreting ambiguous user
messages during the iteration loop. The incident that motivated this
change was an interpretation error mid-conversation, not a step-execution
error — the agent read "looks good" as "build" rather than "iterate."

### 2. Primary guard — strengthen Step 4 (Present) closing

Replace the current closing line:

```
Iterate until the user is satisfied, then wait for `/ship`.
```

With:

```
Iterate until the user is satisfied, then wait for `/ship`.

Do not begin implementation until the user invokes `/ship` or explicitly
asks you to build (e.g., "just build it", "skip /ship and implement").
If the user signals satisfaction with the design but doesn't invoke
`/ship`, prompt: "Ready to /ship this?" The gate exists to prevent
accidental skips, not to block deliberate ones.
```

**Why here:** This is the action boundary — the moment where the agent
decides whether to wait or start building. Constraints at the decision
point have the strongest behavioral influence.

## Version bump

Bump `package.json` version from `0.2.2` to `0.2.3`.

## Housekeeping

Remove `no-build-without-ship.md` from `.meta/inbox/` after implementation
(the proposal has been consumed by this design).

## Tradeoffs

**Preamble-only vs. final-step-only vs. both (decided: both)**

The inbox proposal recommended a Step 0-style preamble. Session discussion
revealed that preambles and final-step notes serve different purposes:
preambles help interpret ambiguous intent mid-conversation; final-step
notes constrain behavior at the action boundary. The incident involved
both an interpretation error (mid-conversation) and a missing action
constraint (at the step boundary), so both placements are warranted. The
preamble is kept lighter to avoid redundancy.

**Calculus change:** If future incidents show agents ignoring the final-step
guard, a stronger mechanism (e.g., a required confirmation step) may be
needed. For now, the soft gate with explicit override is the right weight.

## Open Questions

None — the conversation resolved placement and wording.

## Out of Scope

- Adding guards to `/ship` itself (it's already the gate — no change needed)
- Adding guards to `/review` or `/retro` (these don't produce implementation)
- Automated testing of agent compliance with the guard
