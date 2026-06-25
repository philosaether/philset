# /riff — Skill Proposal (formerly "Lightning Round")

Dropped here from a 2026-05-20 retro on the chipper project.

## Context

The standard philset feature branch lifecycle (/assess → /draft → /ship →
/review) produces strong architecture but has a fixed overhead per feature.
During a grab-bag demo-iteration branch, we naturally shifted to a faster
loop: "build it" → SII → fix → SII → commit. This worked well for small,
contained changes (prefix/suffix, stepper styling) but pace escaped control
when we hit a real engine change (context-aware display) without stepping
back to design it.

## Question

Should philset have a formalized lighter-weight mode for grab-bag
branches? Something lighter than the full lifecycle but with guardrails
to prevent scope creep and ensure review still happens.

**Name: /riff.** Chosen 2026-05-21. Musical improvisation within structure —
you know the key and the chord changes, but you're not reading sheet music.
Encodes *improvisation with guardrails*: a riff has structure (scope gate),
responds to what just happened (SII loop), and knows when to hand back to
the band (/review). Four characters, verb-shaped, natural in conversation:
"let's /riff on the demo page", "go ahead and /riff on that".

Branch prefix: `riff/` (parallels `feature/`).

Possible shape:
- Explicit opt-in ("let's /riff on X")
- Scoped to changes that don't introduce new types or engine concepts
- SII-driven iteration loop as the primary feedback mechanism
- /review still required before merge
- Decisions still logged, but no /draft unless scope escalates

Needs a conversation to figure out the right boundaries.

## Notes from philbas.com session (2026-05-21)

Best-case riff: video embed on philset page. Full cycle from
embed → ornamental framing → caption → /review → merge in one sitting.

### What worked

- **SII loop was the engine.** Screenshot → tweak → rebuild → screenshot.
  Converged in ~6 rounds with no wasted work. Each round was one clear
  adjustment, not a bundle.
- **Discipline held despite speed.** Feature branch created when iteration
  started (not before the first commit). /review still ran, caught a real
  bug (missing CSS variable) and a consistency issue (wrong color token).
  Decisions logged at review time.
- **Scope stayed contained.** Phil asked for ornaments, caption, sizing —
  all styling on a single component. No temptation to redesign the page
  or refactor adjacent SASS.

### What to preserve in the skill

- **Explicit scope gate.** Today's implicit contract: "tiny change, skipping
  draft." The skill should make this explicit — name the scope up front so
  both parties know when it's being exceeded.
- **Iteration loop as primitive.** SII is one flavor (visual). A code-based
  riff needs an equivalent tight loop — maybe test output, lint results, or
  a checklist of small fixes where each gets its own pass.
- **Branch on iteration, not on intent.** We committed the first version
  to main, then branched when we started iterating. That felt right —
  the branch captured the design exploration, not the initial embed.
  - NB: I began with a commit to main because I had already shared the philset page on reddit that morning, and I wanted a video at the top of the conversion pipeline ASAP in case we drew traffic. It fell under a hotfix exception to standard practice, but I didn't surface that because the context didn't feel relevant to the session scope.
    - Once the first push (unstyled embed) was live on prod, I took us to a feature branch and began the LR iteration.
- **/review is non-negotiable.** Even for small scope. Today it caught
  `--radius-md` (undefined) which would have shipped as a silent 0px
  border-radius. The overhead was ~2 minutes.

### Open questions for skill design

- Should /riff support a punch list? ("Here are 5 small things, let's knock
  them out.") Or is it always single-item with repeat invocations?
- What's the scope escalation trigger? Today it would have been if Phil
  asked to redesign the ToC or refactor the ornament pattern into a mixin.
  The skill needs a "this graduated to /draft" escape hatch.
  - Agreed. Some kind of deferral flow.
    - This might be a larger pattern worth generalizing: I often find myself routing specific decisions to a specific project directory's inbox
        - For example, this document was created by two retros in two other project directories.
        - This happens organically in ~60% of /retros, ~20% of casual coding questions, and almost every grab-bag branch so far
    - A general pattern might be something like a /route skill: "/route that to the philset project" means "look in the philset inbox for to-do.md and append this item to it."
        - Or within the same project, "/route that to a better place in the roadmap" would let us build up something like the praxis directory's beta-roadmap.md.
            - That doc arose from an early (pre-formalization) version of the philset flow, but has been invaluable in praxis.
            - I find myself wanting to use it in other long-running projects from time to time. Anything with a time-to-ship > 1 month will probably want a roadmap.
- Does /riff need its own commit style? Today we used normal messages.
  A `riff:` prefix might help git log readability for grab-bag branches.

## Notes from chipper session (2026-05-21)

First deliberate /riff session. Dogfooding the skill on riff/demo-task-sentence.

### Artifacts formalized

- **Tracks** (`tracks/`): sibling of `designs/`, one file per riff branch.
  Append-forward notes — each note is iterated on in place until "played,"
  then frozen. Not strictly append-only, but you don't revise note 1 after
  moving to note 3. Lifecycle: `/riff` creates the track, notes accumulate
  during the session, `/review` still gates merge.

- **Roadmap** (`roadmap.md`): destination for `/defer`. Items land here with
  provenance (which riff deferred them) and trigger conditions (what would
  cause us to pick them up). `/hello` reads it. Distinct from `in-progress.md`
  (what's happening now) — roadmap tracks what we've decided matters but
  isn't happening yet.

### Protocol discovered

- **Notes require sign-off before code.** Claude proposed a design note
  (contingentOn shorthand) and implemented it in the same breath. The right
  flow: write the note to the track → wait for Phil to annotate/approve →
  then build. The note is the lightweight equivalent of a /draft — skipping
  the approval step defeats the purpose.

- **Scope escalation → /defer.** The day-of-month keyword grouping problem
  was surfaced, discussed in the track, and deferred to `roadmap.md` when
  it clearly exceeded riff scope. This is the escape hatch working as
  intended. Suggests a `/defer` skill that routes items to the roadmap
  with provenance.

- **Track as conversation artifact.** The track file serves the same role
  as a design doc in /draft — it's the thing we iterate on, not a summary
  of the conversation. Phil edits in the IDE, Claude updates from the CLI.
  Same inline-annotation workflow, lighter format.

### Open questions refined

- Punch list: this session was effectively a punch list ("build the task
  sentence, fix gaps as they surface"). The track naturally accumulated
  items. Seems like punch lists are emergent from riff sessions, not a
  separate invocation mode.
- Commit style: this session used descriptive messages, no `riff:` prefix.
  The `riff/` branch prefix provides enough context in git log. Separate
  commit prefix may be unnecessary overhead.
