# Reference: roadmap.md

Future work — the project backlog. Items land here via `/defer` (with
automatic provenance) or by hand (without). Read at session start by
`/hello`. Append-forward: not rewritten by `/ttyl`.

## Format

```markdown
# Roadmap

Future work. Items land here via `/defer` or by hand. Each item says
what it is and what's blocking it (if anything). Organized by the user
into categories that make sense for the project.

---

## Category Name (user-defined)

- **Item name** — Description.
  Deferred from: [project]/[branch] ([date]).
  Blocker: [condition] | Due: [date] | (omit line if none)

- **Another item** — Description.
  Deferred from: [project]/[branch] ([date]).
```

## Item fields

- **Name + description** (required): What the item is, in enough detail
  to be actionable during `/hello` triage.
- **Provenance** (automatic via `/defer`, optional for manual entries):
  Source project, branch, and date. Helps recall context when picking
  items up.
- **Resumption condition** (optional): One of:
  - `Blocker: [condition]` — don't build until this is true
  - `Due: [date]` — hard deadline
  - Omitted — pulled from the heap by salience

## Guidelines

- **Categories are user-defined.** A library might use "Design Sessions
  Needed," "Tech Debt," "Future Modes." A nonprofit might use "Programs,"
  "Operations," "Fundraising." No prescribed structure.
- **`/defer` appends to the end.** The user reorganizes into categories
  over time. Don't auto-categorize.
- **Items graduate via `/review`.** When work on a roadmap item is
  reviewed and merged, `/review` archives the item to
  `archive/rearview.md`.
- **Manual additions don't need provenance.** Two tiers: machine-written
  items have full provenance, human-written items may not. Both are valid.
- **Deadlines surface in `/hello`.** Items with `Due:` dates within 14
  days are highlighted during session startup.
