---
name: retro
description: Session retrospective and calibration. Use mid-session (1-2 questions) when you hit a specific friction point or made a judgment call you're unsure about. User invokes with /retro for a fuller end-of-session retrospective.
---

# Retro

This skill has two modes depending on who invokes it.

## Mode: Claude-invoked (mid-session)

You're invoking this because something in the session needs calibration.
Two sub-modes:

### Judgment check

You made a call you're not sure about. Quick, tactical, mid-task.

Rules:
- 1-2 questions maximum
- Each question must reference a **concrete thing that just happened** (a file you edited, an approach you chose, an assumption you made)
- Never ask "how am I doing" or "is this working for you" — those always get "good" and waste a turn
- Good questions sound like: "I went with X instead of Y because Z — was that the right instinct?" or "You paused after I suggested X — was that off-base?"
- If the answer surfaces a reusable insight, route it (see Output Routing below)
- If the answer is just "yeah that's fine" — good, move on, don't belabor it

### Friction diagnosis

You're noticing a pattern that's making the session harder than it should
be — conflicting guidance, skipped context, mismatched expectations, or
repeated miscommunication. This is your escape hatch for collaboration
friction.

When to use this:
- The user gives guidance that contradicts earlier guidance in the same session
- You keep producing work that gets rejected or heavily reworked
- The user seems frustrated but hasn't articulated why
- You're unsure what the user actually wants despite multiple exchanges

How to raise it:
1. **Name the pattern concretely.** Not "this isn't going well" but "I've
   proposed three approaches to X and each was rejected for a different
   reason — I think I'm missing a constraint."
2. **Propose an adaptation.** Frame as you adjusting, not the user being
   wrong: "Would it help if I asked more scoping questions upfront?" or
   "I think I should show you smaller increments instead of full drafts."
3. **Keep it brief.** One observation, one proposal. Don't stack grievances.

If the user confirms the adaptation:
- Route it to `{root}/.meta/WORKFLOW.md` via Output Routing so future
  sessions benefit. This is how idiosyncratic working styles get captured
  over time — rough sessions produce WORKFLOW.md entries that make future
  sessions smoother.
- If no root `.meta/` exists, route to auto-memory as a feedback-type
  memory instead.

If the user dismisses it, drop it and move on. Don't re-raise the same
friction point in the same session.

## Mode: User-invoked /retro (end-of-session)

The user typed `/retro`. This is a structured retrospective.

### Step 1: Gather context

Before asking anything, silently review:
- Git diff since session start (or recent commits)
- Changes to decisions.md and in-progress.md
- What you actually did this session vs what was planned

### Step 1.5: Read agent notes

Check `breadcrumbs.log` in the project `.meta/` for a `## Notes` section.
These are observations from other skills (e.g., `/hello` flagging a missing
root signpost, stale logical-architecture.md, or outdated project skills).
Incorporate relevant notes into your interview questions — they represent
issues the session surfaced but didn't address inline.

### Step 2: Interview (3 questions max)

Ask all questions at once so the user can answer in one message. Pick from:

- **Decisions**: "We decided X. Was that a deliberate call or did we just drift there?"
- **Friction**: "The roughest moment was X. What would have made that smoother?"
- **Surprises**: "Anything come up that changed how you're thinking about the project?"
- **Pace**: "We covered X, Y, Z. Was that the right granularity or should we have gone deeper/wider?"
- **Patterns**: "I noticed I kept doing X. Is that a habit to keep or break?"
- **Discoveries**: "Anything happen this session that we should be doing routinely? A useful improvisation, a workflow that clicked, a tool usage pattern worth formalizing?"

Skip questions where the answer is obvious from context. If it was a smooth session, 1-2 questions is fine. Always include Discoveries unless nothing novel happened.

Agent notes from Step 1.5 can inform question selection — e.g., if `/hello`
noted a missing root signpost, you might fold that into a Friction or
Discoveries question rather than raising it as a separate item.

### Step 3: Output routing

Route insights to the right place. **Only write things that are reusable
in future sessions** — not session-specific details.

Use the tree walk context (from `/hello`) to route each insight to the
correct level of the `.meta/` hierarchy:

**`.meta/` routes** (shared, git-tracked — prefer these):

| Insight type | Destination | Example |
|---|---|---|
| How the user likes to work | `{root}/.meta/WORKFLOW.md` | "Prefers X approach for Y situations" |
| Domain convention | `{domain}/.meta/conventions.md` | "All web projects use BEM naming" |
| Project-specific decision | `{project}/.meta/decisions.md` | "Chose X over Y because Z" |
| Blocker or current state | `{project}/.meta/in-progress.md` | "Feature X is blocked on Y" |
| External reference | `{project}/.meta/decisions.md` | "Design docs live at X, deploy pipeline at Y" |
| New workflow worth adopting | WORKFLOW.md or new skill proposal | "Code review caught real bugs — formalize as /review" |

**Auto-memory routes** (personal, not git-tracked — use only for
user-specific insights that don't belong in shared project state):

| Insight type | Destination | Example |
|---|---|---|
| About the user (role, expertise) | Memory file (type: user) | "Has deep Go expertise, new to React" |
| Approach feedback (do/don't) | Memory file (type: feedback) | "Don't mock databases — prefers integration tests" |

If the tree walk didn't find a root `.meta/`, fall back to
`~/.claude/WORKFLOW.md` for user-level insights. If no domain `.meta/`
exists, route domain-level insights to WORKFLOW.md with a note that they
may belong at a domain level once one is created.

Rules:
- Don't duplicate what's already captured in decisions.md or git history
- Don't write things derivable from reading the code
- Propose all writes, let the user approve before saving
- Keep WORKFLOW.md tight — it's read every session, so only patterns that generalize
- For discovered workflows: propose whether it belongs as a WORKFLOW.md entry, a new skill, or just a thing to remember

### Step 4: Consume agent notes

After routing insights, remove any notes from `breadcrumbs.log` `## Notes`
that were addressed during this retrospective. Leave unaddressed notes in
place — they'll persist for future sessions until consumed or cleared as
stale by `/ttyl`.
