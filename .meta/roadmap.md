# Roadmap

Future work. Items land here via `/defer` or by hand. Each item says
what it is and what's blocking it (if anything). Organized by the user
into categories that make sense for the project.

---

- **Chunks 2–5 (from philset-development-state assessment, 2026-06-25)** —
  chunk 1 (close-the-loop) is done. Next up **chunk 2: multi-user state
  model** (thread-vs-project state partition, branch-based .meta, where
  /ttyl's commit lands — unblocks ttyl-commit and /suspend). Then chunk 3
  (onboarding/voice split), chunk 4 (altitude skills: /study, /bounce),
  chunk 5 (naming hygiene: philset mv). Full plan in the assessment.
- /suspend + /resume skill: workstream switching with state snapshots. Assessed 2026-05-04, annotated, inboxed. Design questions around cross-branch .meta ownership and multi-developer use cases need /draft session.
- ultradraft mode (cloud-based design iteration) — v0.3+
- PM integration via signpost flags — v0.3+
- Context compaction resilience testing
- **Developer documentation for /riff and /defer** — README sections
  covering the new skills, including a section on verification loops
  (where to document project-specific conventions like SII).
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
  Blocker: after /review and merge of this branch
- **Extract hardcoded meta-README from /hello** — /hello Step 3
  scaffolding inlines the .meta/ directory description, duplicating
  templates/meta-README.md. Should reference the template instead.
  Deferred from: philset/feature/riff-defer-skills (2026-05-23).
- **Formalize "external writes go through inbox" principle** — The
  invariant that cross-project writes land in inbox, not directly in
  curated state files. Currently documented in defer-skill.md design
  doc but should be a stated philset principle in the README and
  referenced in skill docs.
  Deferred from: philset/main (2026-05-23).
- **`/bounce` skill (mid-session project switch)** — Runs ttyl-writes
  for the outgoing project + hello-reads for the incoming project in
  one move, without resetting the conversation context. Use case:
  a design session spawns a new project (e.g., WWTS → Aether) and
  you want to continue working without closing the CLI. The manual
  version is safe (update state files, switch working dir, read new
  .meta/) but a skill formalizes it and prevents missed writes.
  Related: /suspend + /resume (already on roadmap) covers the
  multi-session case; /bounce covers the single-session case.
  Deferred from: WWTS/meta/wp-nonprofit-scope (2026-06-17).
- **philset deploy vs. symlink setup** — `philset init`/`update` *copy*
  skills into `~/.claude/skills/` and references into
  `~/Development/.meta/references/`, but the actual dev environment
  *symlinks* each skill into the repo. So `update` would create divergent
  real copies for new skills (e.g. amend/triage), fighting the symlink
  model; references are copy-deployed and silently drift stale. Reconcile:
  make deploy symlink-aware (e.g. a `philset link` command), and/or have
  `update` refresh references reliably. New skills currently require a
  manual `ln -s`.
  Deferred from: philset/feature/close-the-loop (2026-06-25).
- **/riff default cadence + push-based scope** — From the contact-form riff
  postvivem: (1) make note-then-code the *default* cadence `/riff` instructs
  (currently left to the user to establish each session), and (2) support a
  push-based "standing by" scope for parallel-session-driven riffs — Claude
  idles between pushed items instead of pulling the next from a list.
  Deferred from: philset/main (2026-06-25).
- **`/refresh` — lightweight `/study` sibling (working name)** — A fast
  re-orientation / shallow-overview skill: what `/riff` is to `/draft`,
  `/refresh` is to `/study`. Reuses the note→comment→quiz loop (proven
  highly effective for internalizing fast) but for *quick recall*, not a
  full source-grounded deep dive. Two shapes to design for:
  (1) **get back up to speed** on a repo you've been away from — too much
  nuance to trust pure code intuition, but a full `/study` is overkill; and
  (2) **quick topic overview** without entering deep-dive territory.
  Motivating case: the **aether** repo — dropped last week for interview
  prep, hard to pick back up yesterday (implementation-plan + code nuance).
  Consider non-code use cases while drafting, since the loop is
  knowledge-general: prep for next week's meetings, refresh CRM people
  before tonight's nonprofit mixer, brush up college Quantum before a
  conversation with a physicist. Belongs in the altitude-skills family
  (chunk 4, alongside `/study` and `/bounce`); design questions: how it
  relates to / can bootstrap from an existing `/study` doc, how shallow the
  loop goes, whether it produces a durable artifact or is ephemeral like a
  riff track.
  Deferred from: philset/main (2026-07-01).
