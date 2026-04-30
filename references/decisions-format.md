# Reference: decisions.md

Append-only decision log. Add entries as decisions are made during
conversation — don't wait for a skill invocation. Never edit old entries.

## Format

```markdown
# Decisions

Append-only log. Don't edit old entries.

---

2026-04-29: Chose X over Y because Z
2026-04-29: Accepted feature-name design. One-line summary of what was accepted.
2026-04-30: Switched from A to B after discovering C
```

## Guidelines

- One line per decision. Date prefix in YYYY-MM-DD format.
- Focus on the *why*, not just the *what*.
- Only log decisions useful to a future session — not every micro-choice.
- `/ship` appends acceptance entries. `/review` may append merge decisions.
  Check what's already there before adding duplicates.
