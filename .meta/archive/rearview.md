# Rearview — Completed Items

- **Accepted-design lifecycle: amendments** — How an accepted design accepts
  scoped additions/refinements without superseding it. Answered by the
  `/amend` skill (append-only `## Amendments`, settled vs. iterating modes).
  Completed: 2026-06-25 (feature/close-the-loop).
- **Iterate on a design without superseding** — "commit between /drafts",
  iteration numbers on design docs. Answered by `/amend`.
  Completed: 2026-06-25 (feature/close-the-loop).
- **Mid-flight design expansion** — wanting a design sketch mid-implementation
  on an already-shipped design. Answered by `/amend`.
  Completed: 2026-06-25 (feature/close-the-loop).
- **`/ttyl` auto-clean of consumed inbox items** — inbox files processed during a
  session should be auto-cleaned rather than lingering. Shipped in chunk 1;
  `/ttyl` now auto-cleans consumed inbox files (screenshots default-delete).
  (The commit-step half is chunk 2, on the roadmap.)
  Completed: 2026-06-25 (feature/close-the-loop).
- **Where do completed roadmap items live** — the open question of where
  graduated items go. Standardized in chunk 1: one top-level `.meta/archive/`
  mirroring live structure, with `archive/rearview.md` as the item graveyard.
  Completed: 2026-06-25 (feature/close-the-loop).
- **`/hey` — lightweight `/hello`** — informal, local-only session floor with an
  escalation gate; the pressure valve for `/hello` getting heavier. Shipped as
  `skills/hey/skill.md` (Phase 0 of progressive-disclosure): loads cwd `.meta/`
  only, auto-escalates on local-context need, network-exempt.
  Completed: 2026-07-03 (feature/progressive-disclosure).
- **Connector-health check at `/hello`** — flag stale MCP/API auth up front rather
  than discovering it mid-task. Shipped as the `connectors` entry in the
  `hello.check` list (Phase 0 of progressive-disclosure).
  Completed: 2026-07-03 (feature/progressive-disclosure).
- **`private-meta` signpost flag — shared-codebase unblock** — day-one
  survival for running philset inside someone else's repo with no buy-in.
  `philset private` (= `begin --private`, composes with `--dsp`) sets
  `private-meta: true` and ignores `.meta/` (plus an untracked scaffolded
  CLAUDE.md) locally via `.git/info/exclude` — invisible to teammates. No
  runtime skill effect yet (skills don't commit until chunk 2); chunk-2
  commit guard planted in the state-model assessment. v0.3 Tier 1.
  Completed: 2026-07-03 (riff/v0.3-portable-welcoming).
- **README context: "write for humans, not agents"** — 2026-04-30 guidance that
  the README should read for humans deciding to adopt philset, not as agent-facing
  docs. **Applied:** the README voice pass landed essay-voiced and human-facing.
  Audited 2026-07-03 — the "for-humans" goal is met; remaining README work is
  coverage (missing skills), tracked as a separate roadmap item.
  Completed: 2026-07-03 (voice pass in the original README commit; confirmed in the
  v0.3 riff audit).
- **`/study` skill proposal** — staged source-grounded learning loop
  (write→annotate→quiz→score), captured 2026-06-19 from the Honcho interview-prep
  session. Authored into the real skill, shipped and dogfooded (passed the Plastic
  Labs technical). Superseded by `designs/study-skill.md` (accepted, amended A1).
  Completed: 2026-07-01 (feature/study-skill).
