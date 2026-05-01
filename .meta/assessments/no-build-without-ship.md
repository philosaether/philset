# Assessment: No-Build-Without-Ship Guard
Date: 2026-05-01
Branch: bugfix/no-build-without-ship

## Current State

Neither `/assess` nor `/draft` currently contain any language preventing the agent from starting implementation before `/ship` is invoked. The pipeline assumes the agent will wait for `/ship`, but nothing enforces it.

Relevant files:
- `skills/assess/skill.md` — 4 steps (Scope → Explore → Write → Present). No implementation gate.
- `skills/draft/skill.md` — Steps 0–4 (Branch Check → Scope Check → Gather Context → Write Draft → Add to Index → Present). Final instruction is "wait for `/ship`" but it's buried in the Step 4 prose: "Iterate until the user is satisfied, then wait for `/ship`."
- `skills/ship/skill.md` — Step 5 explicitly says "/ship is license to start building immediately." This is the only skill that authorizes implementation.

## What's Working

- The `/ship` skill correctly frames itself as the implementation gate ("license to start building").
- `/draft` Step 4 does mention waiting for `/ship`, but only as a closing remark, not a behavioral constraint.
- The pipeline ordering (assess → draft → ship) is documented in WORKFLOW.md, CLAUDE.md templates, and the README.

## Gaps

1. **No explicit guard in /assess or /draft.** When an assessment contains annotated decisions or a conversation implies urgency, the agent may interpret ambiguous user messages as "skip /draft and build." Nothing in the skill text prevents this.
2. **The "wait for /ship" instruction in /draft is weak.** It's a suggestion in closing prose, not a preamble constraint. Agents process skill instructions top-down; by Step 4, the implementation temptation is strongest.
3. **No guard in /assess at all.** An assessment with clear next steps can feel like a green light to implement, especially if the user says something like "looks good, let's do it" (meaning "let's move to /draft," but parseable as "build it").

## External Input

Inbox item `no-build-without-ship.md` — retro from a philbas.com session (2026-05-01). Documents a concrete incident where:
- Agent interpreted ambiguous user message as "skip /draft and just build"
- Assessment had annotated decisions, making the design feel complete
- No design doc was produced (lost documentation)
- More inline instructions needed during development
- More development iterations than usual
- `/ship` was never invoked — its reconciliation gate was bypassed

The inbox item proposes a Step 0-style preamble for both `/assess` and `/draft`.

## Recommended Next Steps

1. Add a behavioral preamble to `/assess` (after the description, before Step 1) stating: do not begin implementation until `/ship` is invoked. If user intent is ambiguous, ask.
2. Add the same preamble to `/draft` (as a new Step 0 or folded into existing Step 0).
3. Strengthen the existing "wait for `/ship`" line in `/draft` Step 4 to be a clear constraint, not a suggestion.
4. Bump version to 0.2.3 in package.json.
5. Remove the inbox item after implementation.
