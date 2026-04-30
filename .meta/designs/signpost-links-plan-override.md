---
Status: accepted
Date: 2026-04-30
Accepted: 2026-04-30
Assessment: ../assessments/philset-v021.md
---

# Signpost Quick Links + Plan Override — Desired State

Two additions to the signpost/skill system: a `links` field in
signpost.yml for cross-project file shortcuts, and a mechanism to
override Claude Code built-in skills that conflict with philset's
iterative workflow.

---

## 1. Signpost Quick Links

### What changes

Add a `links` field to `signpost.yml` — a map of name → file path.
`/hello` reads these during the tree walk and displays them in the
session summary.

### Schema addition

```yaml
links:
  workflow-improvements: ~/Development/meta/.meta/inbox/workflow-improvements.md
  career-plan: ~/Development/meta/.meta/designs/career-trajectory.md
```

Field spec:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `links` | map<string, string> | `{}` | Named shortcuts to frequently-used files |

Values are file paths. `~` expansion is expected (the agent resolves
them at read time).

### Inheritance

Links merge across the tree walk: parent links are available to children,
child links are added to the set. On key collision, child overrides parent.

Example:
- Root signpost has `career-plan: ~/Development/meta/...`
- Project signpost has `architecture: .meta/logical-architecture.md`
- Session sees both links

### `/hello` changes

**Step 1 (tree walk):** When reading signpost.yml at each level, collect
`links` entries into a merged map (outermost-first, child overrides).

**Step 7 (summary):** If quick links exist, display them:

> Quick links: career-plan, workflow-improvements, architecture

One line, names only — the agent has the paths and can read them when
referenced. No need to print full paths in the summary.

### Breadcrumb persistence

Store the assembled links map in `breadcrumbs.log` under `## Quick Links`
so they survive context compaction. Format:

```
## Quick Links
- career-plan: ~/Development/meta/.meta/designs/career-trajectory.md
- workflow-improvements: ~/Development/meta/.meta/inbox/workflow-improvements.md
```

`/ttyl` clears this section along with other breadcrumb content.

### Reference doc update

Add `links` to `references/signpost-schema.md` with the schema,
inheritance rules, and an example.

### Files to modify

- `skills/hello/skill.md` — Steps 1 and 7
- `~/Development/.meta/references/signpost-schema.md` — add `links` field
- `~/Development/.meta/signpost.yml` — add Phil's quick links

---

## 2. Plan Override

### The problem

philset's assess → draft → ship flow is a deliberate alternative to
Claude Code's plan mode. Plan mode's "approve then execute" feedback
loop assumes one round of alignment is enough. philset's loop (assess →
draft → iterate → ship → implement) is slower but:

- Produces a durable artifact (the design doc)
- Catches subtle misalignments between human and agent intent
- Surfaces tradeoffs explicitly
- Allows inline iteration via IDE editing

When both are available, plan mode is a tempting shortcut that bypasses
the iterative workflow. Today this happened live — plan mode would have
produced working code with misaligned docs.

### Which skills conflict?

| Built-in | philset equivalent | Conflict | Action |
|----------|-------------------|----------|--------|
| `/plan` | `/assess` → `/draft` → `/ship` | Direct — different feedback loop | Override by default |
| `/ultraplan` | same | Same conflict, cloud variant | Override by default |
| `/review` | `/review` | Name collision — philset's is a superset | No action needed — philset wins by precedence |
| `/ultrareview` | `/review` (partial) | Cloud-based deep review vs. philset's pre-merge review | Don't override — complementary, different use case |
| `/simplify` | (none) | No conflict — code quality tool, complementary | Don't override |
| `/batch` | (none) | No conflict — parallel execution tool | Don't override |
| `/loop` | (none) | No conflict — recurring task runner | Don't override |

### Implementation

Add to `/hello` Step 0 (Philset orientation), after the two-cadence
explanation:

> philset overrides the following Claude Code skills by default:
> - `/plan` and `/ultraplan` — replaced by the assess → draft → ship
>   flow, which produces collaborative design docs instead of
>   approve-then-execute plans
>
> Do not invoke these skills unless the user's signpost.yml sets
> `allow-plan: true`. If the user explicitly asks for plan mode
> (e.g., "enter plan mode", "use /plan"), comply — the override is
> a default, not a prohibition.

### Signpost flag

Add `allow-plan` to the signpost schema:

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `allow-plan` | bool | `false` | Re-enable `/plan` and `/ultraplan` for this directory tree |

Inherited like other flags — a parent's `true` applies to children
unless overridden.

### Reference doc update

Add `allow-plan` to `references/signpost-schema.md`.

### Files to modify

- `skills/hello/skill.md` — Step 0
- `~/Development/.meta/references/signpost-schema.md` — add `allow-plan`
- WORKFLOW.md — add note about plan override

---

## Tradeoffs

### Quick links in signpost vs. separate file

**Chosen: signpost.yml.** Links are configuration, and signpost.yml is
the configuration file. A separate file adds indirection without benefit.

**Alternative: `.meta/links.yml`.** Keeps signpost.yml minimal. Rejected
because links are a signpost concern (they're discovered during the tree
walk), and the signpost is already designed for extension.

### Breadcrumb persistence for links vs. re-reading signpost

**Chosen: breadcrumbs.** Context compaction can lose the tree walk
results. Breadcrumbs survive compaction and give the agent a reference
point without re-walking the tree.

**Alternative: trust the context window.** Simpler, but fragile for long
sessions. The cost of writing a few lines to breadcrumbs is negligible.

**What would change the calculus:** If Claude Code adds native context
compaction protection for skill outputs, breadcrumbs become unnecessary.

### Override scope — just /plan, or also /ultraplan?

**Chosen: both.** /ultraplan is the same feedback loop (approve then
execute) in a cloud wrapper. The conflict is with the model, not the
execution environment.

**Alternative: allow /ultraplan.** It's a different enough experience
(browser review, inline comments) that it might complement /draft.
Rejected because the core problem — single-round alignment — is the same.

**What would change the calculus:** If /ultraplan added multi-round
iteration (comments → revisions → re-review), it would become
complementary rather than conflicting.

**Future possibility: ultradraft.** Use cloud infrastructure for design
iteration rather than plan-then-execute — browser-based review of design
docs, parallel tradeoff exploration, inline comments on the draft. Would
complement `/draft` rather than replace it. Deserves its own assessment
when the time comes (v0.3+).

### Override mechanism — signpost flag vs. WORKFLOW.md instruction

**Chosen: both.** Signpost flag (`allow-plan`) for machine-readable
opt-in. WORKFLOW.md note for human context. Step 0 instruction for
agent behavior. This is the kind of user quirk `/retro` should surface.

**Alternative: just Step 0 instruction.** Simpler, but not configurable
per-project. A user who wants plan mode for quick scripts but not for
major features can't express that.

## Resolved Questions

1. **Quick links display format.** Clickable file paths, not just names.
   Links are useful to both humans and agents during the session (e.g.,
   a `code-quality.md` link is something the human will want to open too).

2. **Context compaction resilience.** Don't over-engineer yet. breadcrumbs.log
   is durable on disk (stop hook writes after every prompt), but not
   automatically re-read after compaction unless a skill tells the agent to.
   If compaction becomes a real problem, breadcrumbs.log is the natural
   persistence layer. For now, philset sessions are token-efficient enough
   that this hasn't been an issue.

## Out of Scope

- Overriding `/review` (name collision resolves naturally — philset wins)
- Overriding `/simplify`, `/batch`, `/loop` (complementary, no conflict)
- Quick link auto-completion or fuzzy matching (future polish)
- Dynamic links (e.g., "most recently modified design doc")
