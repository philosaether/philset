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
