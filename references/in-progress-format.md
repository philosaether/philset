# Reference: in-progress.md

Current work state. Updated constantly, pruned when done. This file is
read at the start of every session by `/hello` — keep it tight.

## Format

```markdown
# In Progress

Current work state. Update constantly, delete items when done.

---

## Active

- Feature X: brief description of current state and immediate next step
- Bug Y: what's broken, what's been tried

## Parked

- Feature Z: was deprioritized because of W. Branch: `feature/Z`. Resume when condition changes.
```

## Guidelines

- **Active**: things being worked on right now. Include enough context
  that a fresh session can pick up without asking.
- **Parked**: active work deliberately suspended. Include the branch name
  and the reason. This is present-tense paused work, not future backlog.
- Move items between sections as their status changes. Delete completed
  items — don't leave them as clutter.
- **Future work and ideas go in `roadmap.md`**, not here. `in-progress.md`
  is present-tense only.
