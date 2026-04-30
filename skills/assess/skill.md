---
name: assess
description: Assess the current state of a feature, system, or area. Produces a durable assessment doc that downstream skills (/draft, /plan) can consume. Use --capacity to include napkin math (QPS, storage, bandwidth).
---

# Assess

Structured assessment of a feature, system, or area. The user typed `/assess <topic>` — produce a durable snapshot of where things stand.

The assessment doc is the bridge between orientation (/hello) and design work. It answers: what exists, what's working, what's broken, and what's missing?

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Scope

Identify what's being assessed from the user's topic. This could be:
- A feature area ("multiuser support", "task assignment")
- A system component ("the rules engine", "priority sharing")
- A workflow ("the invite flow", "the deploy pipeline")
- An external input ("alpha feedback", "inbox items")

State the scope back to the user in one line. If it's ambiguous, ask.

## Step 2: Explore

First, check `assessments/` in the state dir (including any archive subdirectory) for prior assessments on this topic. Prior research may be stale but provides useful baseline context.

Gather current state from the codebase and docs. Depending on the topic:
- Read relevant source files, templates, endpoints
- Check git log for recent changes in the area
- Read related design docs, decisions, and in-progress items
- Check for known bugs or TODOs mentioning the topic
- Check inbox for related feedback

Go deep enough to be accurate. Don't skim.

## Step 3: Write the assessment

If the topic involves infrastructure, scaling, or data — include a
Capacity Estimate section with napkin math. Skip for UI, workflow, or
process assessments unless the user asks for it (via `--capacity` flag
or informally). When in doubt, a few lines of rough math is better than
none.

Create or update a file at `assessments/<topic-slug>.md` in the state dir with this structure:

```markdown
# Assessment: <Topic>
Date: <today>
Branch: <current branch>

## Current State
What exists today. Be specific — name files, endpoints, schema, UI elements.

## What's Working
Features/flows that are functional and tested (or at least manually verified).

## Gaps
What's missing, broken, or incomplete. Reference known bugs from in-progress.md if relevant.

## Capacity Estimate (if applicable)

Napkin math for the system under assessment. Estimate what matters for
the topic — not all of these will apply:

- Users / concurrency
- Requests (QPS, daily volume)
- Payload sizes
- Storage (total, growth rate)
- Bandwidth
- Cost implications

Show your math. Rough is fine — the goal is order-of-magnitude awareness,
not precision. Flag assumptions that would change the architecture if
wrong by 10x.

## External Input
Any feedback, requests, or constraints from users, inbox items, or design docs.

## Recommended Next Steps
Ordered list of what to do next, informed by the gaps and input above.
Not a plan — just directional. The plan comes later.
```

Keep it factual and concise. This doc should be useful to a fresh session that hasn't seen the exploration.

## Step 4: Present

Show the user the assessment. They may adjust scope, correct assumptions, or redirect before moving to design/planning.
