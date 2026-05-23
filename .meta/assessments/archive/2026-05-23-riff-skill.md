# Assessment: /riff Skill
Date: 2026-05-23
Branch: feature/riff-defer-skills

## Current State

/riff has been used informally in two sessions across two projects. No
skill.md exists yet, but the protocol and artifacts are well-defined from
dogfooding.

### Sessions completed

**1. philbas.com video embed** (2026-05-21, html project)
- Best-case riff: video embed → ornamental framing → caption → /review → merge
- SII loop as primary engine (~6 rounds)
- Scope stayed contained (single component styling)
- /review caught a real bug (`--radius-md` undefined)
- No track file — predates the tracks convention

**2. chipper demo-task-sentence** (2026-05-21, chipper project)
- First deliberate /riff session with full artifact trail
- Branch: `riff/demo-task-sentence`, 4 feature commits + 1 review commit
- Track file: `tracks/riff-demo-task-sentence.md` (251 lines, 6 notes)
- 5 items deferred to `roadmap.md` via the escape hatch
- 7 decisions logged
- Merge commit: `merge riff/{topic}: {features}`

### Artifacts that emerged

**tracks/ directory** — sibling of `designs/`, one file per riff branch.
Each track is a running design scratchpad with numbered notes. Notes are
iterated on in place until "played," then frozen. Not strictly append-only
but you don't revise note 1 after moving to note 3. The track is the
conversation artifact (same role as a design doc in /draft, lighter format).

**riff/ branch prefix** — parallels `feature/`. Encodes the mode in the
branch name. The merge commit uses `merge riff/{topic}: {features}`.

### Protocol discovered

1. **Scope gate**: Name the scope up front. Both parties know when it's
   being exceeded.
2. **Note-before-code**: Write the note to the track → wait for sign-off
   → build. The note is the lightweight equivalent of a /draft. Threshold:
   "does this change behavior or introduce a concept?" If yes, note first.
   Bug fixes and one-line changes can be noted after the fact.
3. **Iteration loop**: SII for visual work, test/verify for logic work.
   Tight loop: change → verify → change → verify.
4. **Scope escalation → /defer**: When something exceeds riff scope,
   `/defer` it to `roadmap.md` with provenance. Clean escape hatch.
5. **/review gates merge**: Non-negotiable, even for small scope.

## What's Working

- **The protocol is proven.** Two sessions, two different project types
  (styling vs. engine work), both converged cleanly.
- **Tracks as scratchpads work.** The chipper track captured 6 design
  notes, each iterated in place, all frozen by session end. Phil edited
  in IDE, Claude updated from CLI — same inline-annotation workflow as
  /draft.
- **Scope discipline held.** Multiple items exceeded scope and were
  cleanly deferred. No cowboy coding despite the lighter process.
- **Note-before-code prevents runaway implementation.** Discovered when
  Claude implemented contingentOn shorthand without sign-off. The
  correction became the key guardrail.
- **/defer is now formalized.** The escape hatch has a real skill backing
  it (shipped earlier this session).

## Gaps

### 1. No skill.md

The protocol exists in inbox docs and Phil's head. Needs to be codified
as `skills/riff/skill.md` so any session can invoke it.

### 2. tracks/ not yet canonical

`tracks/` exists in chipper but isn't part of the philset scaffold. Needs
to be added to:
- `philset begin` scaffolding
- `/hello` reading (if tracks exist, mention them)
- `.meta/README.md` template
- `logical-architecture.md`
- A reference doc for the track format

### 3. Track lifecycle unclear

When does a track get archived? Options:
- After /review and merge (move to `archive/tracks/`)
- Never (stay on main as historical record, since they're small)
- The chipper track stayed in `tracks/` after merge — no archival happened

- Leaning "never"
  - But honestly, that might just be sentimentality. Design docs have real lookup value after-the-fact: they track architectural choices and design decisions.
  - Does a riff track have similar value? And if so, how do we make that value accessible without grepping ad nauseum?
    - I think /review prepends an "index" to the riff track noting the topic and line number of each note played
    - Then we add the track to tracks/index.md with a bulletted list of decisions made in that track
  - But will that be helpful? Notes never get superseded, and if we try to track them all individually index.md may get pretty huge without giving us much benefit
- Think this needs a Tradeoffs analysis in the draft tbh.
  - And we may just have to try it out and see how it plays in practice.

### 4. Interaction with /hello

/hello doesn't mention riff branches or tracks. If you start a session
on a `riff/` branch, /hello should recognize the mode and surface the
track file.

### 5. Interaction with /review

/review works as-is (it diffs against base branch). But it doesn't know
about tracks — it could reconcile the track's notes against what was
actually committed, similar to design reconciliation.

### 6. Punch list mode

Both sessions were effectively punch lists — "build X, fix gaps as they
surface." The track naturally accumulated items. This seems emergent, not
a separate invocation mode. But the skill should acknowledge the pattern.

### 7. When to /riff vs. /draft

The boundary: /riff is for changes that don't introduce new types or
engine concepts (from the original proposal). But the chipper session
*did* introduce new concepts (dateExpression, contingentOn shorthand) —
the note-before-code protocol made this safe. The real boundary might be:
"can you describe the change in a track note rather than a design doc?"
- I think it's a question of scale.
  - We're drawing the line intuitively right now: I catch myself saying things like "This feature feels just big enough for a /draft."
    - The alternative is that it's small enough to handle in a riff
  - As a project matures, we'll probably observe a rising proportion of riffs to drafts.

## External Input

From `lightning-round-proposal.md`:
- Explicit scope gate, iteration loop as primitive, branch on iteration
  not intent, /review non-negotiable
- Name chosen deliberately: musical improvisation within structure

From `riff-defer-postvivem.md`:
- Track creation: one track per branch (felt right)
- /review interaction: just remind, don't auto-invoke
- Note approval threshold: "does it change behavior or introduce a concept?"
- Punch lists are emergent from riff sessions

From `to-do-annex.md`:
- Session modes in /hello: build sessions vs. devex sessions. /riff
  overlaps with devex sessions — both are exploratory and scope grows
  organically.
  - Yeah, I think we were reaching towards the /riff pattern with that note -- we can consider it superseded (and clear it) with this feature.

From WORKFLOW.md:
- "During /riff sessions, tracks/ files are design scratchpads — things
  that need iteration between Phil and Claude. Bug fixes and mechanical
  changes go straight to commits with descriptive messages. Tracks are
  not session logs; git log serves that role."
  - Yup.

So we're looking at three scales of changes:
  - Mechanical / trivial: just do it and tell git
  - Small / straightforward: riff on it 'till it feels right
  - Large / foundational: design and iterate until it's as perfect as practical

## Recommended Next Steps

1. **Draft /riff skill.md** — The protocol is clear enough to write
   directly. Key sections: scope gate, track creation, note-before-code
   protocol, iteration loop, scope escalation via /defer, /review reminder.

2. **Add tracks/ to the philset scaffold** — template, reference doc,
   /hello awareness, logical-architecture.

3. **Decide track lifecycle** — archive after merge or leave in place.
   Leaning leave in place (they're small and useful for git blame context).

4. **Update /hello** — recognize `riff/` branches, surface track file,
   adjust status readout for riff mode.

5. **Update /review** — optional track reconciliation (compare notes
   against commits, flag unplayed notes).
