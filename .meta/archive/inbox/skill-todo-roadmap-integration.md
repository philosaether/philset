# Skill integration with roadmap.md and to-do.md

During the riff/contact-form-fixes session (chipper, 2026-06-09), Phil
manually checked off to-do.md items as they were completed. This should
be automated.

## Desired behavior

### /riff

- When a riff note is played (implemented + committed), check if there's
  a matching item in `to-do.md` or `roadmap.md` and mark it done or
  remove it.
- The "Begin Riff Scope" marker pattern (items below the line are in
  scope) could be formalized — the skill could read items below the
  marker as the session's scope and track completion against them.

### /draft → /ship

- When a design is shipped, check if there's a matching roadmap item
  and graduate it (move to rearview). /review already does this in
  Step 8, but /ship could do it at acceptance time too.

### /defer

- /defer already writes to roadmap.md and to-do.md. The reverse flow
  (completing deferred items) should be equally automatic.

## Open questions

- Should completion be automatic (Claude removes/checks items without
  asking) or confirmatory (Claude proposes and waits)?
- How to match items? By keyword? By explicit item ID?
- Should the scope marker be a standard format (e.g., `## Riff Scope`)
  or freeform?
