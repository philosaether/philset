# Decisions

Append-only log. Don't edit old entries.

---

2026-04-29: Accepted philset v0.2 design. Tree hierarchy via signpost.yml, user context at tree root WORKFLOW.md, two-cadence model, logical-architecture.md moves to .meta/.
2026-04-30: Accepted skill-improvements design. /draft gets permanent Tradeoffs section (before Open Questions). /assess gets optional Capacity Estimate section (agent discretion + --capacity flag).
2026-04-30: Accepted signpost-links-plan-override design. Quick links in signpost.yml (merged across tree walk, displayed as clickable paths). /plan and /ultraplan overridden by default; allow-plan signpost flag to opt back in.
2026-04-30: Accepted philset-npm-package design. Separate philset repo (philosaether/philset), not same as meta. v0.2.1, Node builtins only, README before publish.
2026-04-30: philset repo created. Skills, philset-specific designs, and assessment moved from meta. Meta retains career and personal designs.
2026-05-01: Accepted no-build-without-ship design. Implementation gate in /assess and /draft to prevent agents skipping /ship.
2026-05-01: Guard placement: primary constraint at final step (action boundary), lighter framing note earlier. Agents weight local step instructions more heavily than preambles when generating responses — constraints at the decision point are most effective.
2026-05-23: Accepted defer-skill design. /defer skill with two destinations: roadmap.md (local, curated backlog) and inbox/to-do.md (cross-project, staging area). Both promoted to canonical .meta/ files. in-progress.md loses "To Explore" section. Graduation via /review → archive/rearview.md. Agent-invoked deferral (like /retro). Natural language invocation, no rigid syntax.
2026-05-23: Accepted riff-skill design. /riff for lightweight iteration with tracks/, note-before-code protocol, /defer as escape hatch. Three-scale model: mechanical (commit), riff (track note), draft (design doc). Tracks stay in tracks/ (no archival, no index). Intuitive scope boundary, not formal rule.
2026-05-23: Deferred: developer documentation for /riff and /defer (blocker: after merge).
2026-06-25: Accepted philset-development-state assessment. Triaged inbox (17 items). Emergent model: philset is a gradient of iteration-loop altitudes (mechanical→riff→amend→draft→study), strong at opening artifacts and weak at closing their loops. Work plan: chunk 0 hygiene, chunk 1 close-the-loop (Theme A), chunk 2 multi-user state model (Theme B), chunk 3 onboarding/voice (Theme C).
2026-06-25: Resolved: /ttyl will commit .meta/ state. Auto-clean of consumed inbox items = chunk 1; the commit step is gated on the chunk 2 state model (where branch-volatile state lives so multi-dev repos don't conflict).
2026-06-25: Resolved: multi-stage-ship needs no new skill — /ship accepts, implement what you can, in-progress.md carries the rest. Closed and archived.
2026-06-25: Archived consumed inbox dogfood notes (riff-defer-postvivem, lightning-round-proposal, to-do-annex, multi-stage-ship) to inbox/archive/ — mirrors assessments/archive/. Note: this is an interim choice; archival standardization is itself a chunk 1 task.
2026-06-25: Accepted close-the-loop design (Theme A). (1) Standard archival: one top-level .meta/archive/ mirroring live structure (supersedes per-type <type>/archive/); migrate assessments/archive/ and inbox/archive/ in. (2) /amend skill — append-only Amendments section on accepted designs, settled vs. iterating modes. (3) Item lifecycle: todo.md is the item-inbox, roadmap.md the curated/ordered backlog, archive/rearview.md the graveyard; /triage skill promotes todo→roadmap; graduation pulls from wherever the item lived. (4) Graduation added to /riff and /ship (was /review-only) and extended to todo.md. (5) /ttyl auto-cleans consumed inbox files; screenshots default-delete (archive-screenshots signpost flag). (6) Riff scope → aspirational ## Targets list in the track. Rename to-do.md→todo.md atomically. ttyl commit step deferred to chunk 2.
