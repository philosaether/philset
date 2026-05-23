# Reference: inbox/to-do.md

Inbound items awaiting triage. Items arrive via cross-project `/defer`
(with automatic provenance) or by hand (without). Read at session start
by `/hello`. Triage is manual — process items into `roadmap.md` entries,
designs, or dismiss them.

## Format

```markdown
# To Do

Items for triage. From cross-project `/defer` or manual capture.

---

- **Item name** — Description.
  Deferred from: [project]/[branch] ([date]).
  Blocker: [condition] | Due: [date] | (omit line if none)

- **Manual item** — Just a description, no provenance needed.
```

## Guidelines

- **Cross-project items carry provenance.** `/defer` writes the source
  project, branch, and date automatically.
- **Manual items don't need provenance.** Opening the file in an editor
  and adding a bullet is a valid workflow.
- **Triage happens locally.** During a `/hello` session, process inbox
  items into `roadmap.md` entries (with full project context), kick off
  `/assess` or `/draft`, or dismiss.
- **Same item format as roadmap.md.** Provenance line, optional
  blocker/deadline. Items that graduate to the roadmap can be moved
  as-is.
