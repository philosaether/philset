# Assessment: Workstream Switching Skill
Date: 2026-05-04
Branch: main

## Current State

philset has no mechanism for concurrent workstreams within a single project.
The current model assumes one active feature branch at a time:

- `in-progress.md` is a flat list — Active items coexist but there's no
  concept of "this thread is suspended, that one is live"
- `/draft` creates designs on the current branch; `/ship` implements on the
  current branch; `/review` diffs the current branch against main
- `decisions.md` is append-only and branch-unaware — decisions from all
  workstreams interleave
- `breadcrumbs.log` is overwritten each session — single-thread assumption
- Git branches exist per feature, but `.meta/` state doesn't track which
  branch owns which work items

**Concrete example**: `~/Development/meta` is on `feature/linkedin-branding`
with 4 active work items, 8 designs, and a rich in-progress.md. To start a
new workstream (TODO collection across projects), Phil would need to
manually: stash/commit, switch branches, mentally partition in-progress.md,
and hope the next `/hello` session doesn't conflate the two threads.

## What's Working

- Git branches already provide code isolation per feature
- `in-progress.md` sections (Active/To Explore/Parked) loosely model
  priority tiers — a suspended workstream is conceptually "Parked with
  intent to resume"
- `/hello` reads branch name and could key off it
- `/ttyl` captures session state — if it knew about workstreams, it could
  snapshot the right one
- The design doc pipeline (`/draft` → `/ship` → `/review`) is already
  scoped per design, not per session

## Gaps

### 1. State partitioning (the core problem)

`in-progress.md` mixes all workstreams. When you suspend linkedin-branding
and start todo-collection, the linkedin items need to be frozen somewhere
retrievable, and in-progress.md needs to reflect only the active thread.

**Options:**
- **a) Branch-keyed snapshots**: `/suspend` saves a snapshot of
  in-progress.md (and possibly breadcrumbs.log) to something like
  `.meta/workstreams/linkedin-branding.md`, then rewrites in-progress.md
  for the new context. `/resume` reverses it.
- **b) Inline tagging**: Add workstream tags to in-progress.md items
  (`[linkedin]`, `[todo-sweep]`). Skills filter by active workstream.
  No file shuffling needed.
- **c) Branch-local .meta/**: Use git's branch isolation — each branch
  has its own in-progress.md state. Problem: decisions.md and designs/
  would diverge across branches, causing merge pain.

Option (a) is the cleanest — it matches the coroutine metaphor directly.
Option (c) is a trap (merge conflicts in append-only logs are miserable).
- Agreed.nBut what happens in multi-developer, multi-repo projects?
  - You raised a good bit of pushback: most of my repos are one-feature-at-a-time, but that's because I'm a solo developer right now.
    - One of the main reasons I need to suspend LinkedIn development is to wait for Ronique to get back to me with his action items, and that's going to be a common problem in multi-developer workspaces. What if your branch is in review?
      - In that case, the workstream would have had /review called on it, but it would not have been merged to main. If a serious issue comes up in PR review, the user would likely /draft an update to the accepted design doc, iterate, and /ship -> /review again.
      - Do we actually need to do anything different to support that use case? I'm not sure we do.
  - On the other hand, if I suspend one feature and work on another, I'm now committing <suspended-feature.md> to my second feature branch's .meta
    - Which isn't necessarily a problem -- we just have to catch it in /review, or add a .gitignored section to the project .meta
    - Or keep suspended threads in user context, keyed to their project
      - philset mv could keep up with that, but drag-and-drop in Finder would break suspended threads in that case
  

### 2. Git branch interaction

`/suspend` needs to handle uncommitted work. Two sub-cases:
- **Clean working tree**: just `git switch` to the new/existing branch
- **Dirty working tree**: commit WIP, or `git stash` with a named ref

Named commits (`wip: suspend linkedin-branding`) are safer than stashes —
stashes are invisible and easy to lose. The skill should auto-commit WIP
with a conventional prefix.

### 3. decisions.md across workstreams

Append-only log shouldn't be partitioned — decisions from all threads are
project-level context. But `/suspend` should note the switch itself:
```
2026-05-04: Suspended linkedin-branding, started todo-sweep workstream.
```

### 4. designs/ across workstreams

Designs are already named files — no conflict. `designs/index.md` could
gain a Workstream column, but it's not strictly necessary since designs
reference their feature branch in frontmatter.

### 5. Resumption context

When resuming a suspended workstream, `/hello` needs enough context to
orient without replaying the entire prior session. The workstream snapshot
needs to capture:
- in-progress.md Active section (what was being worked on)
- Current branch name
- Brief status line ("left off after: X")
- Any breadcrumbs.log notes

### 6. Skill interactions

| Skill | Impact |
|-------|--------|
| `/hello` | Needs to detect suspended workstreams, show them in status |
| `/ttyl` | Needs to snapshot active workstream before session end |
| `/draft` | No change — already per-design |
| `/ship` | No change — already per-design |
| `/review` | No change — already per-branch |
| `/retro` | May want workstream-scoped retro |

## Recommended Next Steps

### Level of effort: Medium-small

The skill itself is straightforward — the hard part is the integration
touchpoints in hello/ttyl. Here's what needs to happen:

**New files:**
1. `skills/suspend/skill.md` — the /suspend skill (~60-80 lines)
2. `skills/resume/skill.md` — the /resume skill (~40-60 lines)
3. Maybe a `references/workstream-format.md` for the snapshot format

**Modified files:**
4. `skills/hello/skill.md` — add workstream awareness to status summary
   (~10 lines: check `.meta/workstreams/`, list suspended threads)
5. `skills/ttyl/skill.md` — snapshot active workstream on session end
   (~5 lines: save current in-progress Active to workstream file)
6. `templates/` — no changes needed (workstreams/ dir created on first use)
7. `logical-architecture.md` — add new skills

**Total**: 2 new skill files, 2 skill modifications (small), 1 reference
doc. No CLI changes. No new dependencies.

### Comparison to LinkedIn work

The LinkedIn workstream in meta involves iterating on 4+ design docs,
writing/reviewing profile copy, coordinating with Ronique, and building
an EventsNYC page. That's multi-session, content-heavy work with external
dependencies.

Building /suspend + /resume is a **contained tooling task**: two new
skills, two small modifications, one reference doc. It's the kind of
thing that fits in a single session with `/draft` → `/ship` → `/review`.

**Verdict: /suspend is easier.** A focused session could draft and ship
it in a few hours. The LinkedIn work has weeks of runway left.

### Risk: premature optimization?

The honest question: how often does Phil actually need concurrent
workstreams in the same project? The meta project is the main case —
it's a catch-all for career + personal + coordination work. Most
project repos (praxis, philset, eventsnyc) are single-feature-at-a-time.

If meta is the only case, a lighter alternative: just use in-progress.md
Parked section manually and switch branches. The skill adds convenience
but the manual version works today.
