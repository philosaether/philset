---
Status: accepted
Date: 2026-04-30
Accepted: 2026-04-30
Assessment: ../assessments/philset-v021.md
---

# philset npm Package — Desired State

Build and publish the `philset` CLI as an npm package. The package bundles
skills, templates, and reference docs. Victory condition: `npm install -g
philset` then `philset dsp` launches a Claude Code session with full
philset context.

Spec is in philset-v0.2.md §4. This design covers implementation details
and gaps the spec didn't address.

---

## 1. Package Structure

```
philset/                       (new repo — philosaether/philset)
├── package.json
├── bin/
│   └── philset.js             # CLI entry point, Node builtins only
├── skills/                    # moved from meta/skills/
│   ├── hello/skill.md
│   ├── assess/skill.md
│   ├── draft/skill.md
│   ├── ship/skill.md
│   ├── review/skill.md
│   ├── retro/skill.md
│   └── ttyl/skill.md
├── templates/
│   ├── CLAUDE.md              # Self-sufficient project template
│   ├── meta-README.md         # .meta/ convention explainer
│   ├── signpost.yml           # Default project signpost (empty)
│   ├── signpost-root.yml      # Root signpost (root: true)
│   ├── WORKFLOW.md            # User context template
│   ├── decisions.md           # Empty decisions log with header
│   └── in-progress.md         # Empty in-progress with header
├── references/                # Bundled copies of format docs
│   ├── decisions-format.md
│   ├── designs-index.md
│   ├── in-progress-format.md
│   └── signpost-schema.md
├── README.md                  # Human-facing (see meta inbox/readme-context.md)
├── CLAUDE.md                  # Repo's own CLAUDE.md (not the template)
└── .meta/                     # Living documentation — philset eats its own dogfood
    ├── decisions.md
    ├── in-progress.md
    ├── designs/               # philset-specific designs moved from meta
    └── assessments/
```

Key decision: **separate `philset` repo.** The meta workspace is personal
(career, workflow reflection). philset is headed for OSS. Separating now
means the philset repo's `.meta/` serves as living documentation — proof
the system works. Meta gets a quick link to philset for easy navigation.

Repo setup:
- Create `~/Development/philset/` (`philosaether/philset` on GitHub)
- Move `skills/` from meta to philset
- Move philset-specific designs: philset-v0.2, skill-improvements,
  signpost-links-plan-override, philset-npm-package
- Meta keeps: career-trajectory, h1-praxis-graph, praxis-mcp-session
- Add quick link in meta's `.meta/signpost.yml`
- Update `~/.claude/skills/` symlinks to point to philset/skills/

## 2. package.json

```json
{
  "name": "philset",
  "version": "0.2.1",
  "description": "Claude Code skills library for iterative, document-driven development",
  "license": "MIT",
  "bin": {
    "philset": "bin/philset.js"
  },
  "files": [
    "bin/",
    "skills/",
    "templates/",
    "references/",
    "README.md"
  ],
  "keywords": [
    "claude",
    "claude-code",
    "ai",
    "development-workflow",
    "skills"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/philosaether/meta.git"
  }
}
```

No dependencies. Node builtins only (`fs`, `path`, `child_process`,
`readline`, `os`).

## 3. CLI Commands

All commands in `bin/philset.js`. Single file, ~200 lines.

### `philset init`

First-time setup. Interactive (prompts for root dir).

1. Ask for root development directory (default: `~/Development`)
2. Create `{root}/.meta/` if it doesn't exist:
   - `signpost.yml` from `templates/signpost-root.yml`
   - `WORKFLOW.md` from `templates/WORKFLOW.md`
   - `references/` — copy all files from package `references/`
3. Init `{root}/.meta/` as a git repo if not already one
4. Install skills: copy `skills/` → `~/.claude/skills/`
   (overwrite existing, create dir if needed)
5. Print success message with next steps

### `philset begin [--dsp]`

Start a session in cwd.

1. If `.meta/` doesn't exist in cwd, scaffold it:
   - `README.md` from `templates/meta-README.md`
   - `decisions.md` from `templates/decisions.md`
   - `in-progress.md` from `templates/in-progress.md`
   - `designs/.gitkeep`
   - `assessments/.gitkeep`
   - `inbox/.gitkeep`
2. If `CLAUDE.md` doesn't exist in cwd, copy from `templates/CLAUDE.md`
3. Launch `claude` (or `claude --dangerously-skip-permissions` with `--dsp`)

Uses `execSync` with `{ stdio: 'inherit' }` so claude gets the terminal.

### `philset dsp`

Alias: calls `begin` with `--dsp`.

### `philset update`

Update skills and references to match installed package version.

1. Find root by walking up from cwd looking for
   `.meta/signpost.yml` with `root: true`
2. Overwrite `~/.claude/skills/` with package `skills/`
3. Overwrite `{root}/.meta/references/` with package `references/`
4. Report what changed (list files that differed)

### `philset sync [--remove]`

Copy or remove project-local skills.

- `sync`: copy `~/.claude/skills/` → `.claude/skills/` in cwd
- `sync --remove`: delete `.claude/skills/` in cwd

### `philset help`

```
philset — Claude Code skills for iterative, document-driven development

Usage:
  philset init              First-time setup (root dir, skills, references)
  philset begin [--dsp]     Scaffold .meta/ + CLAUDE.md if needed, launch claude
  philset dsp               Alias for begin --dsp
  philset update            Update global skills and reference docs
  philset sync [--remove]   Copy (or remove) skills to project .claude/skills/
  philset help              Show this message

Quick start:
  philset init              # one-time setup
  cd my-project && philset dsp   # start working
```

## 4. Templates

### `templates/CLAUDE.md`

```markdown
# CLAUDE.md

## Session Start

Read these files first:
- `.meta/decisions.md` - Workflow decisions (append-only log)
- `.meta/in-progress.md` - Active explorations
- `.meta/inbox/` - Files dropped for review

**During the session:** When making workflow decisions, append to
`.meta/decisions.md`. When starting/finishing explorations, update
`.meta/in-progress.md`.

## Conventions

This project uses [philset](https://github.com/philosaether/meta) for
session management. Start sessions with `/hello`, end with `/ttyl`.
```

### `templates/meta-README.md`

```markdown
# .meta/

Project working state. Tracked in git, maintained by the team.

- `decisions.md` — Append-only decision log. Add entries, never edit old ones.
- `in-progress.md` — Current work state. Update constantly, prune when done.
- `designs/` — Design docs. Created with `/draft`, implemented with `/ship`.
- `assessments/` — State-of-the-world snapshots. Created with `/assess`.
- `inbox/` — Drop files here for review (screenshots, references, etc.).
```

### `templates/signpost.yml`

```yaml
# philset signpost — project-level configuration
# See references/signpost-schema.md for all fields
```

### `templates/signpost-root.yml`

```yaml
root: true
```

### `templates/WORKFLOW.md`

```markdown
# Working with [Your Name]

Accumulated patterns and preferences. Loaded by `/hello` at session start.

## Communication

- [How you prefer to communicate — terse? detailed? ask questions?]

## Code Style

- [Your code conventions — naming, formatting, patterns]

## Project Patterns

- [Common patterns across your projects]

## Session Habits

- [How you like to work — bursts? long sessions? context-switching?]

---

*Canonical location: [your root]/.meta/WORKFLOW.md*
```

### `templates/decisions.md`

```markdown
# Decisions

Append-only log. Don't edit old entries.

---
```

### `templates/in-progress.md`

```markdown
# In Progress

Current work state. Update constantly, delete items when done.

---

## Active

## To Explore

## Parked
```

## 5. References

Bundled copies of the 4 reference docs from `~/Development/.meta/references/`.
These are copied into the package's `references/` directory and installed
to the tree root by `philset init` and `philset update`.

The package's copies are the source of truth — the tree root copies are
installed artifacts. `philset update` overwrites them.

## 6. README.md

Separate `/draft` session — see `inbox/readme-context.md` for voice
guidance. For now, a minimal placeholder that gets the package published.
We iterate on it after the CLI works.

## Tradeoffs

### Separate philset repo vs. same repo as meta

**Chosen: separate repo.** Meta is personal (career, workflow reflection).
philset is OSS-bound. The philset repo's `.meta/` serves as living
documentation — proof that the system works. Meta gets a quick link.

**Alternative: same repo with `files` filtering.** Avoids the move, but
couples personal career docs with an OSS package. The calculus changed
when we decided to open-source: philset-specific designs in `.meta/`
become public documentation, while career-trajectory stays private.

### Minimal README now vs. full README before publish

**Chosen: minimal now.** The README needs iterative drafting (per
inbox/readme-context.md), and that shouldn't block publishing a working
CLI. Ship v0.2.1 with a functional placeholder, iterate in v0.2.2.

**Alternative: block publish on polished README.** Better first
impression for npm browsers. Rejected because the immediate user is
Phil — external users come later with OSS launch (~June).

Updated: code first, then README before publish (same session).

### `execSync` for claude launch vs. `spawn`

**Chosen: `execSync` with `stdio: inherit`.** Simplest — hands the
terminal to claude and blocks until it exits. No signal forwarding
needed.

**Alternative: `spawn` with piped stdio.** More control but more
complexity. Only needed if we want to intercept claude's output, which
we don't.

## Resolved Questions

1. **Auto-commit scaffolded `.meta/`?** No — leave unstaged. Can't
   guarantee git is initialized. For git-less projects, `/draft` Step 0
   (branch check) should gracefully handle "not a git repository" — skip
   the check and continue. No need to add git detection to `/hello`.

2. **Version strategy.** 0.2.1 — continues the v0.2 design lineage.

3. **Symlinks vs. `philset update` for global skills.** Keep symlinks
   (`~/.claude/skills/` → `~/Development/philset/skills/`) for daily
   driving — changes reflected instantly. To test the published package,
   use `philset sync` in a scratch project, which installs to
   `.claude/skills/` (project-local slot). `philset update` is for
   end-users who don't have the repo cloned. The two modes are mutually
   exclusive for the global slot — `philset update` would overwrite
   symlinks with regular files.

## Out of Scope

- `philset sync` project-local skill management (implement but keep simple)
- CI/CD for npm publish (manual for now)
- Windows support (macOS/Linux only for now)
