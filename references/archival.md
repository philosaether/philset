# Reference: archival

Where closed artifacts go. One convention, used by every skill that
archives.

## The convention

**One top-level `.meta/archive/` that mirrors the live structure.**

```
.meta/
  designs/            archive/
  assessments/    →     designs/        ← superseded designs (/ship)
  inbox/                assessments/    ← consumed assessments (/review)
  roadmap.md            inbox/          ← consumed inbox files (/ttyl)
  inbox/todo.md         rearview.md     ← completed roadmap/todo items
```

## Rules

- **Files** move to `archive/<same-relative-path>` — a superseded design
  goes to `archive/designs/`, a consumed assessment to `archive/assessments/`,
  a processed inbox file to `archive/inbox/`.
- **Entries** (completed roadmap/todo *items*, which aren't their own files)
  append to `archive/rearview.md` with a `Completed: <date> (<branch>)`
  stamp. One flat rearview log per project. Create it on first use with the
  header `# Rearview — Completed Items`.
- **Date prefix** on archival where it aids ordering (assessments already do
  `YYYY-MM-DD-<slug>.md`). Designs keep their name — frontmatter + git carry
  the date.
- **`tracks/` do not archive.** They stay in `tracks/`; git log is their
  history (decided 2026-05-23).
- **Screenshots** (SII files) default to *delete*, not archive, once acted
  on. The `archive-screenshots: true` signpost flag opts into keeping them.

## Who writes here

- `/ship` — superseded designs → `archive/designs/`
- `/review` — consumed assessments → `archive/assessments/`; completed
  roadmap/todo items → `archive/rearview.md`
- `/ttyl` — consumed inbox files → `archive/inbox/`
- `/triage`, `/riff`, `/ship` — graduate completed items → `archive/rearview.md`

## Note

This supersedes the older per-type `<type>/archive/` layout (e.g.
`assessments/archive/`). Projects created before this convention may carry
the old layout; migrate when convenient — it isn't load-bearing.
