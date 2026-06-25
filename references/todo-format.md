# Reference: inbox/todo.md

The **item-inbox**: inbound work items awaiting triage. `todo.md` is to work
*items* what `inbox/` is to *files* — a staging area, unordered and
untriaged. Items arrive via cross-project `/defer` (with automatic
provenance) or by hand (without). Read at session start by `/hello`.

It sits at a different *stage* from `roadmap.md`, not a different *kind*:

```
inbox/todo.md   →[/triage]→   roadmap.md   →[done]→   archive/rearview.md
 (staging,                    (curated,                (completed)
  unordered)                   ordered)
```

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
- **Triage is the gate.** `/triage` walks open items and promotes the real
  ones to `roadmap.md` (the curated, ordered backlog), knocks out small ones
  directly, or resolves/discards. `/hello` nudges toward `/triage` when the
  list grows large.
- **Promotion is optional.** A small item can be done straight from `todo.md`
  without ever hitting the roadmap — promote only when you want to prioritize
  it against other committed work.
- **Completed items graduate.** When a todo item is done (via `/triage`,
  `/riff`, `/ship`, or `/review`), it moves to `archive/rearview.md` with a
  `Completed: <date> (<branch>)` stamp — see `archival.md`.
- **Same item format as roadmap.md.** Items that graduate to the roadmap can
  be moved as-is.
