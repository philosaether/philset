# Assessment: philset v0.2.1
Date: 2026-04-30
Branch: feature/philset-v021

## Current State

philset v0.2 is accepted and partially shipped. Skills are the source of
truth in `meta/skills/`, symlinked to `~/.claude/skills/`. Seven skills
exist: hello, assess, draft, ship, review, retro, ttyl. Each is a single
`skill.md` file.

The tree hierarchy works: `~/Development/.meta/signpost.yml` has
`root: true`, `/hello` walks up from cwd and discovers context. WORKFLOW.md
lives at the tree root. Reference docs exist at
`~/Development/.meta/references/` (4 files: signpost-schema, designs-index,
decisions-format, in-progress-format).

No npm package exists yet. The `philset` name is reserved on npm. No
`package.json`, no `bin/`, no `templates/`, no bundled `references/` in
the meta repo.

**Files that need changes:**

| File | Change |
|------|--------|
| `skills/draft/skill.md` | Add tradeoffs section to template |
| `skills/assess/skill.md` | Add capacity estimation step |
| `skills/hello/skill.md` | Add quick links support, add plan override to Step 0 |
| `references/signpost-schema.md` | Add `links` field, add `allow-plan` field |
| `~/Development/.meta/signpost.yml` | Add Phil's quick links |
| `package.json` (new) | npm package metadata |
| `bin/philset.js` (new) | CLI entry point |
| `templates/*` (new, 5 files) | CLAUDE.md, meta-README, signposts, WORKFLOW |
| `references/*` (new, 4 files) | Bundled copies of tree root references |
| `README.md` (new) | Human-facing package docs |

## What's Working

- Tree walk context discovery — tested across multiple projects
- Skill invocation via symlinks — all 7 skills function correctly
- Two-cadence model — developer session (/hello↔/ttyl) and development
  session (/draft↔/review) operate independently
- State files (decisions.md, in-progress.md) persist across sessions
- Reference docs provide format guidance for skills

## Gaps

### Skill improvements (from 2026-04-29 retro)

**Tradeoff analysis in /draft.** The design doc template has no structured
place for alternatives considered. Tradeoffs surface organically in Open
Questions but aren't captured as decisions. In interview contexts, visible
"I considered X and Y, here's why" reasoning is high-signal. In regular
development, it prevents relitigating decisions later.

Need to decide: where in the template does it go? Before or after Open
Questions? What guidance does the skill give about granularity — every
micro-decision, or only forks that could plausibly go either way?
- Before, probably right before. It provides context for open questions

**Capacity estimation in /assess.** Infrastructure and scaling assessments
need napkin math (users × requests × payload → storage/QPS/bandwidth). We
did this informally in the EKS session but it wasn't a structured part of
the skill. Not every assessment needs it — a UI design doesn't need QPS.

Need to decide: always-present optional section, or triggered by topic
type? If triggered, what's the heuristic? How much guidance do we give
about what to estimate vs. leaving it to judgment?
- Agent can add at agent's discretion if it feels relevant
- Human can request with explicit flag (--capacity) or informally ("and please include a capacity estimation")

### Signpost quick links

No `links` field in signpost.yml schema. `/hello` has no mechanism to
surface cross-project file references. Users currently navigate by knowing
paths or asking Claude to find things.

The workflow-improvements doc suggests links live in the root signpost
(available everywhere) but we should consider: can project-level signposts
add links too? How do they merge with parent links?
- Yes, and append in context. The tree walk assembles an "active quick-links" array
  - And stores it in breadcrumb Notes as protection against context compaction?
  - Open question: how does the philset perform across context compaction? Do we lose guidance from /hello?

### Plan override

Claude Code has built-in skills that overlap with philset:

| Built-in | philset equivalent | Conflict? |
|----------|-------------------|-----------|
| `/plan` | `/assess` → `/draft` → `/ship` | Yes — /plan's "approve then execute" model conflicts with philset's iterative design docs |
| `/review` | `/review` | Name collision — built-in reviews PRs, philset does pre-merge analysis with design reconciliation |
| `/simplify` | (none, but /review covers some of it) | No — complementary |
| `/batch` | (none) | No — orthogonal |
| `/ultraplan`, `/ultrareview` | (none) | No — cloud variants, different use case |

The `/plan` conflict is the most important. Plan mode's feedback loop
(plan → approve → execute) assumes one round of alignment is enough.
philset's loop (assess → draft → iterate → ship → implement) is slower but
produces a durable artifact and catches drift that plan mode misses (like
the README voice issue surfaced today).

The `/review` name collision is real but less urgent — philset's review is
a superset of the built-in. Users won't accidentally invoke the wrong one
because philset skills take precedence when installed.

Need to decide: which built-in skills does philset override? Just `/plan`,
or also `/review`? What's the opt-back-in mechanism? Signpost flag
(`allow-plan: true`) is proposed.
- Curious about ultraplan and ultrareview -- we may WANT to conflict with them.
- Also curious about simplify and batch. When we /draft this portion, please include a summary of what each of these skills does for further discussion.

### npm package

Everything from §4 of the v0.2 design needs building:
- CLI with 6 commands (init, begin, dsp, update, sync, sync --remove)
- Templates (5 files)
- Bundled references (4 files)
- README (human-facing — see inbox/readme-context.md)

The CLI is mechanically simple (~200 lines, Node builtins only) but the
templates and README need iterative design to get the voice right.

## External Input

- **inbox/workflow-improvements.md**: Tradeoff analysis, capacity
  estimation, quick links, and clear-inbox command (deferred)
- **inbox/readme-context.md**: Notes on README voice — must be human-facing,
  explain what philset IS, not how Claude should use it
- **Session conversation (today)**: Phil wants assess→draft→implement for
  each change, not batch execution. Plan mode should be explicitly
  overridden by philset. The selling point: "collaborative plans using a
  discursive development style which leverages both human and agentic
  intelligence to minimize rework and maximize output."

## Recommended Next Steps

1. `/draft` the skill improvements (tradeoffs + capacity estimation) —
   small scope, can be one design doc
2. `/draft` signpost quick links + plan override — these touch the same
   files (signpost schema, /hello) so they pair naturally
3. `/draft` the npm package — CLI, templates, references, README. This is
   the biggest piece and the README especially needs iteration.
4. Implement each design as it's accepted
5. Publish to npm, test end-to-end with `philset dsp`
