# Roadmap

Future work. Items land here via `/defer` or by hand. Each item says
what it is and what's blocking it (if anything). Organized by the user
into categories that make sense for the project.

---

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
