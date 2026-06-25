# Postvivem: riff/contact-form-fixes (2026-06-09)

Cross-project riff session where a parallel Claude instance building a
chipper contact form in philbas.com surfaced bugs, and a second instance
in the chipper repo fixed them in real time. First heavy-lift production
consumer of chipper.

## What went well

### Note-then-code cadence

Every fix followed: note proposal → user rubber-stamp → implementation →
commit. This prevented Claude from running ahead of intent. The key was
**explicit upfront instructions** — Phil told Claude to "write a note
proposing a fix, which I will probably rubber-stamp after reading" at
session start. Without this, riff sessions sometimes collapse into
note-and-code (Claude writes the note and implements simultaneously).

**Why it matters:** The rubber-stamp step is fast (~30 seconds) but
catches misunderstandings before code is written. Two of the six notes
got small corrections (row-click toggle: "activate only, not deactivate";
line collapse: "latent only, not dormant"). Both would have required
rework if code had been written first.

**Recommendation for /riff skill:** Make note-then-code the default
cadence. The skill should explicitly instruct Claude to wait for approval
after each note before implementing. Current riff skill doesn't enforce
this — it's left to the user to establish.

### Push-based scope (standby pattern)

Instead of pulling items from a list, the session used a push model:
Phil brought bugs as the parallel session surfaced them. Claude stood by
between items. This matched the grab-bag nature of bug-bash work — scope
arrived organically rather than being planned upfront.

**Why it matters:** Pull-based scope (working down a to-do list) creates
pressure to keep going even when the parallel session hasn't surfaced the
next issue yet. Push-based scope lets the support session idle naturally.

**Recommendation for /riff skill:** When the riff is driven by a parallel
session, the track should note the push-based pattern and Claude should
explicitly say "standing by" after each item rather than pulling the next
one from the list.

### Cross-project changelog

A changelog file was dropped in the consumer project's inbox
(`html/philbas.com/.meta/inbox/chipper-contact-form-fixes.md`) so the
parallel session could incorporate fixes without guessing. Updated
mid-session as new fixes landed.

**Recommendation:** When a riff is driven by a consumer project, the
track file should note the changelog location and Claude should update
it after each fix.

## Two-note pattern for multi-cause bugs

The KOE Enter key bug had two root causes (keystroke forwarding +
stale hover highlight). These were addressed in two separate notes
and two commits. This was the right granularity — each note was
self-contained and each commit was reviewable independently.

## Scope marker in to-do.md

A "Begin Riff Scope" line in to-do.md cleanly separated backlog items
from session scope. Items above the line were explicitly out of scope.
See the companion deferral about to-do.md/roadmap.md skill integration.
