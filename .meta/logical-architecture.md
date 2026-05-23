# Logical Architecture

philset — Claude Code skills library for iterative, document-driven development.

## Top-Level Structure

```
philset/
├── bin/philset.js        # CLI entry point (init, begin, dsp, update, sync, help)
├── skills/               # Nine workflow skills, each a skill.md
│   ├── hello/            # Session startup — context loading, status summary
│   ├── ttyl/             # Session wind-down — persist decisions and progress
│   ├── assess/           # Current state snapshot of a feature/system/area
│   ├── draft/            # Design doc creation and collaborative iteration
│   ├── ship/             # Accept design, begin implementation
│   ├── riff/             # Lightweight iteration — tracks, note-before-code
│   ├── review/           # Pre-merge review with design reconciliation
│   ├── retro/            # Mid-session calibration or end-of-session retrospective
│   └── defer/            # Backlog-building — capture future work with provenance
├── templates/            # Scaffolding copied by init/begin
│   ├── CLAUDE.md         # Project-level Claude instructions
│   ├── WORKFLOW.md       # User context placeholder
│   ├── decisions.md      # Append-only log template
│   ├── in-progress.md    # Work state template (Active, Parked)
│   ├── roadmap.md        # Future work template (deferred items)
│   ├── meta-README.md    # .meta/ directory explainer
│   ├── signpost.yml      # Project-level signpost (no root flag)
│   └── signpost-root.yml # Root-level signpost (root: true)
├── references/           # Format docs installed to user's .meta/references/
│   ├── signpost-schema.md
│   ├── decisions-format.md
│   ├── in-progress-format.md
│   ├── roadmap-format.md
│   ├── tracks-format.md
│   ├── to-do-format.md
│   └── designs-index.md
├── assets/               # Static assets (XKCD image for README)
├── .meta/                # This project's own working state
├── package.json          # v0.2.2, zero dependencies, Node builtins only
├── CLAUDE.md             # Project-specific instructions
└── README.md             # User-facing documentation
```

## CLI (`bin/philset.js`)

Single executable, no dependencies. Commands:

| Command | Purpose |
|---------|---------|
| `init` | One-time setup: root signpost, references, global skills |
| `begin [--dsp]` | Scaffold .meta/ + CLAUDE.md, launch Claude Code |
| `dsp` | Shorthand for `begin --dsp` |
| `update` | Update global skills and references from package |
| `sync [--remove]` | Copy global skills to project-local .claude/skills/ |
| `help` | Usage summary |

Key utilities: `findRoot()` (tree walk), `diffReport()` (compare dirs), `copyDirRecursive()`.

## Skills Pipeline

Two orthogonal cadences:

- **Workday:** `/hello` → work → `/ttyl`
- **Feature:** `/assess` → `/draft` → `/ship` → `/review`
- **Riff:** `/riff` → note-before-code loop → `/review`
- **Backlog:** `/defer` (agent-invoked or explicit, routes to roadmap or inbox)
- **Calibration:** `/retro` (mid-session or end-of-session)

## State Persistence

All state lives in `.meta/` directories, organized as a tree:

```
~/Development/              # root (signpost.yml: root: true)
├── .meta/WORKFLOW.md       # user context
├── domain/.meta/           # domain conventions (optional)
└── project/.meta/          # project state
    ├── decisions.md        # append-only decision log
    ├── in-progress.md      # current work state (Active, Parked)
    ├── roadmap.md          # future work (deferred items, append-forward)
    ├── designs/            # design docs (draft → accepted → implemented)
    ├── tracks/             # riff scratchpads (one per riff branch)
    ├── assessments/        # state snapshots (archived when consumed)
    ├── inbox/              # drop zone for review
    │   └── to-do.md        # cross-project deferrals and manual capture
    ├── archive/rearview.md # graduated roadmap items
    └── logical-architecture.md  # this file
```

Context merges outermost-first during `/hello` tree walk. `signpost.yml` controls inheritance flags (`root`, `architecture`, `links`, `allow-plan`).
