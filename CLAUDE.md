# CLAUDE.md

## Session Start

Read these files first:
- `.meta/decisions.md` - Workflow decisions (append-only log)
- `.meta/in-progress.md` - Active explorations
- `.meta/inbox/` - Files dropped for review

**During the session:** When making workflow decisions, append to
`.meta/decisions.md`. When starting/finishing explorations, update
`.meta/in-progress.md`.

## Project Purpose

philset — Claude Code skills library for iterative, document-driven
development. npm package providing CLI tooling and skills.

## Conventions

- Skills source of truth: `skills/*/skill.md`
- Templates for scaffolding: `templates/`
- Reference docs for file formats: `references/`
- CLI entry point: `bin/philset.js`
- No dependencies beyond Node builtins
