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
- **`/skim` skill** — study-family sibling: "goes just deep enough to hurt."
  Recognition-level, breadth-first learning for name-dropping domains — research the
  terms worth recognizing, teach them in batched 1–2¶ lessons with a quiz per item,
  distill to a cold/fuzzy/known one-line-each summary. Built per
  `designs/skim-skill.md` (accepted). Proving target: the AI-ecosystem Decoder Ring
  (`ai-ecosystem-integration.md §1.4`). NOTE: the roadmap item lived in stashed
  `meta/readme-updates` WIP (the heading-adjustment 2026-07-11 M3 dump), not on
  `main` — remove it from that branch's roadmap when the stash is restored.
  Completed: 2026-07-13 (feature/skim-skill).
- **`/hey` + `/hello` minimal walk misses philset config at bare paths** — walk
  instructions said "signpost.yml / root WORKFLOW.md" without naming `.meta/` as
  their home; a fresh session checked bare paths and ran unconfigured. Fixed in
  `/hey` (names `<dir>/.meta/signpost.yml` + `<root>/.meta/WORKFLOW.md`
  explicitly); `/hello`'s walk already anchored `.meta/` and needed no change.
  Reproduced live at this session's own `/hey` before fixing.
  Completed: 2026-07-22 (meta/readme-updates, 3bc0840).
- **`/hello` calendar window boundary-exclusive bug** — `list_events` treats
  `endTime` as exclusive, so a next-morning meeting starting exactly at the
  ~10am cap was silently dropped (cost a 10:00am final-round interview surfacing,
  2026-07-06). Fixed: window padded to tomorrow ~noon + an explicit
  exclusive-bound warning in the skill.
  Completed: 2026-07-22 (meta/readme-updates).
- **`/defer` → skim-list as a deferral target** — `/defer` now recognizes the
  skim-list destination (append topics to a project's "deferred skim-list"
  roadmap item) and `/skim` Step 1 offers to drain it. Specimen:
  `study/.meta/roadmap.md`.
  Completed: 2026-07-22 (meta/readme-updates).
- **`/skim` feedback round** — optional second pass answering the learner's
  inline notes/questions before/alongside the quiz, now Step 3.3 of the batch
  loop (mirrors `/study`'s annotate→comment). Earned in the decoder-ring skim.
  Completed: 2026-07-22 (meta/readme-updates).
- **signpost.yml `extra-steps` field** *(discarded as duplicate)* — already
  absorbed into the Tier 4 "Signpost per-skill config" roadmap item (merge noted
  there since 2026-07-01); the todo copy was never cleaned. No new work.
  Resolved: 2026-07-22.
- **Port central-meta-repo local hacks into the library** — the work machine's
  central-`.meta`-repo behaviors, reimplemented from the Changelog-v2 spec as
  signpost-gated library features: inherited `central-meta:` field (unset =
  off; PHILSET_CENTRAL override), `philset adopt` subcommand as the single
  5-case adopt/relink path (`philset private` wraps it pre+post scaffold),
  `/ttyl` Step 6.5 central commit + non-fatal push, `/hello` Step 1.5 +
  `/hey` cwd relink checks, signpost schema/docs updated, 9-case sandboxed
  test suite (`npm test`). Delivers chunk 2's ttyl-commit slice with the
  reality-tested one-repo-per-session answer. Design:
  `designs/central-meta-port.md` (accepted 2026-07-22).
  Completed: 2026-07-22 (feature/central-meta-port).
