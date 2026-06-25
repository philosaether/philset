# CLAUDE.md

## Session Start

Read these files first:
- `.meta/decisions.md` - Workflow decisions (append-only log)
- `.meta/in-progress.md` - Active work and parked branches
- `.meta/roadmap.md` - Future work and deferred items
- `.meta/inbox/` - Files dropped for review (including `todo.md`)

**During the session:** When making workflow decisions, append to
`.meta/decisions.md`. When starting/finishing work, update
`.meta/in-progress.md`. Use `/defer` to add items to the roadmap or
route work to other projects.

## Project Purpose

philset — Claude Code skills library for iterative, document-driven
development. npm package providing CLI tooling and skills.

## Conventions

- Skills source of truth: `skills/*/skill.md`
- Templates for scaffolding: `templates/`
- Reference docs for file formats: `references/`
- CLI entry point: `bin/philset.js`
- No dependencies beyond Node builtins
