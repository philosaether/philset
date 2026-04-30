# Reference: designs/index.md

The designs index tracks active design documents. Superseded docs are
archived — only current designs appear here.

## Format

```markdown
# Designs Index

| Doc | Status | Date | Summary |
|-----|--------|------|---------|
| [feature-name.md](feature-name.md) | draft | 2026-04-29 | One-line summary |
| [other-feature.md](other-feature.md) | accepted | 2026-04-28 | One-line summary |
```

## Status values

- **draft** — Under active iteration. Created by `/draft`.
- **accepted** — Blessed for implementation. Set by `/ship`.
- **active** — Implemented and serving as current spec.
- **active (unreliable)** — Implementation has drifted from the doc. Needs audit.

Superseded docs are moved to `archive/designs/` by `/ship` and removed
from this index.
