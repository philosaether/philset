# Logical Architecture

philset — Claude Code skills library for iterative, document-driven development.

## Top-Level Structure

```
philset/
├── bin/philset.js        # CLI entry point (init, begin, dsp, update, sync, help)
├── skills/               # Fourteen workflow skills, each a skill.md
│   ├── hello/            # Session startup — context loading, status summary
│   ├── hey/             # Lightweight session floor — local-only, auto-escalates, network-exempt
│   ├── ttyl/             # Session wind-down — persist decisions, auto-clean inbox
│   ├── assess/           # Current state snapshot of a feature/system/area
│   ├── study/           # Deeply learn an existing system via staged source-grounded loop
│   ├── skim/            # Recognition-level breadth learning — /study's breadth-first sibling
│   ├── draft/            # Design doc creation and collaborative iteration
│   ├── ship/             # Accept design, begin implementation
│   ├── amend/            # Scoped addition to an accepted design (no supersede)
│   ├── riff/             # Lightweight iteration — tracks, note-before-code
│   ├── review/           # Pre-merge review with design reconciliation
│   ├── retro/            # Mid-session calibration or end-of-session retrospective
│   ├── defer/            # Backlog-building — capture future work with provenance
│   └── triage/           # Process inbox todo items into the curated roadmap
├── templates/            # Scaffolding copied by init/begin
│   ├── CLAUDE.md         # Project-level Claude instructions
│   ├── WORKFLOW.md       # User context placeholder
│   ├── decisions.md      # Append-only log template
│   ├── in-progress.md    # Work state template (Active, Parked)
│   ├── roadmap.md        # Future work template (deferred items)
│   ├── meta-README.md    # .meta/ directory explainer
│   ├── todo.md           # inbox item-inbox template
│   ├── study-doc.md      # Study artifact — stages, quiz loop, Quiz Log
│   ├── study-index.md    # Study index — durable learning artifacts
│   ├── skim-doc.md       # Skim artifact — item list, batched lessons, cold/fuzzy/known summary
│   ├── skim-index.md     # Skim index — durable recognition artifacts
│   ├── signpost.yml      # Project-level signpost (no root flag)
│   └── signpost-root.yml # Root-level signpost (root: true)
├── references/           # Format docs installed to user's .meta/references/
│   ├── signpost-schema.md
│   ├── decisions-format.md
│   ├── in-progress-format.md
│   ├── roadmap-format.md
│   ├── tracks-format.md
│   ├── todo-format.md
│   ├── designs-index.md
│   ├── study-format.md
│   ├── skim-format.md
│   └── archival.md
├── scripts/              # Dev-only tooling, excluded from the npm package
│   └── dev-link.js       # `npm run link` — symlink skills+refs into place (dev live-edit)
├── test/                 # Sandboxed tests (dev-only, excluded from the npm package)
│   └── adopt.test.js     # `npm test` — pins the five `philset adopt` cases (throwaway $HOME)
├── assets/               # Static assets (XKCD image for README)
├── .meta/                # This project's own working state
├── package.json          # v0.3.x, zero dependencies, Node builtins only; scripts: link (dev), test
├── CLAUDE.md             # Project-specific instructions
└── README.md             # User-facing documentation
```

## CLI (`bin/philset.js`)

Single executable, no dependencies. Commands:

| Command | Purpose |
|---------|---------|
| `init` | One-time setup: root signpost, references, global skills |
| `begin [--dsp] [--private]` | Scaffold .meta/ + CLAUDE.md, launch Claude Code |
| `dsp` | Shorthand for `begin --dsp` |
| `private [--dsp]` | Shorthand for `begin --private`: ignore .meta/ locally (shared repo); with `central-meta` configured, also adopts/relinks .meta into the central repo (pre- and post-scaffold) |
| `adopt` | Adopt/relink this project's .meta into the central repo (`central-meta:` signpost field or `PHILSET_CENTRAL`); no-op when adopted, stop-and-ask on a local↔central conflict. Shared entry point for `/hello`/`/hey` relink offers |
| `update` | Update global skills and references from package |
| `sync [--remove]` | Copy global skills to project-local .claude/skills/ |
| `help` | Usage summary |

Key utilities: `findRoot()` (tree walk), `findSignpostField()` (inherited signpost value, closest wins), `resolveCentral()` (env → signpost → off), `ensureCentralRepo()` (first-use init), `adoptMeta()` (five-case adopt/relink), `ensureMetaExcluded()` (symlink-safe `/.meta` exclude), `diffReport()` (compare dirs), `copyDirRecursive()`, `enablePrivateMeta()` (signpost flag + `.git/info/exclude`).

## Skills Pipeline

Two orthogonal cadences:

- **Workday:** `/hello` → work → `/ttyl`
- **Feature:** `/assess` → `/draft` → `/ship` → `/review`, with `/amend` for
  scoped additions to accepted designs
- **Riff:** `/riff` → note-before-code loop → `/review`
- **Backlog:** `/defer` in (routes to roadmap or inbox), `/triage` to promote
  inbox todo items to the roadmap, graduation out to `archive/rearview.md`
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
    │   └── todo.md         # item-inbox: cross-project deferrals, manual capture
    ├── archive/            # closed artifacts, mirrors live structure
    │   ├── designs/        # superseded designs
    │   ├── assessments/    # consumed assessments
    │   ├── inbox/          # processed inbox files
    │   └── rearview.md     # graduated roadmap/todo items
    └── logical-architecture.md  # this file
```

Context merges outermost-first during `/hello` tree walk. `signpost.yml` controls inheritance flags (`root`, `architecture`, `links`, `allow-plan`).
