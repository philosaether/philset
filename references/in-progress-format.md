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

## To Explore

- Idea A — one-line context for why it's interesting
- Idea B — reference to where it came up

## Parked

- Feature Z: was deprioritized because of W. Resume when condition changes.
```

## Guidelines

- **Active**: things being worked on right now. Include enough context
  that a fresh session can pick up without asking.
- **To Explore**: interesting but not committed. May become Active or
  get deleted.
- **Parked**: deliberately set aside. Include the reason so you remember
  why.
- Move items between sections as their status changes. Delete completed
  items — don't leave them as clutter.
