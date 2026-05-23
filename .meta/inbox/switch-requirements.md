# /switch — Requirements from 2026-05-05 Session

Gathered by manually switching contexts 3 times in one session (EKS → meta-merge → debug-mode → prevent-signups). These are empirical friction points, not theoretical.

---

## Core Problem

philset tracks feature-branch state in `.meta/` files (in-progress.md, designs/index.md, decisions.md). These files are either:
- **Untracked** (current state — .meta isn't committed to praxis yet), meaning they float across branches with no isolation at all
- **Tracked** (post-.meta-merge), meaning both branches modify the same lines → guaranteed merge conflicts

Neither mode gives you branch-scoped state for free.

## Friction Notes

| # | Observation | Implication |
|---|-------------|-------------|
| 1 | Parking is trivial when branch is clean, unclear when dirty | /switch needs a dirty-state policy (commit? stash? refuse?) |
| 2 | Main happened to match EKS branch's .meta — lucky coincidence | Can't assume .meta on main matches the branch you're leaving |
| 3 | in-progress.md mixes branch-specific state (Active) with project-wide state (bugs, roadmap, deferred) | Needs structural separation — not all of in-progress.md is branch-scoped |
| 4 | Both branches edit the same lines of in-progress.md → guaranteed merge conflict | Core problem. /switch must prevent this or make resolution trivial |
| 5 | "What's branch-specific?" requires judgment | Skill needs clear ownership rules, not per-case reasoning |
| 6 | Branch naming at creation time assumes you know the scope. Real work reshuffles before you write code | /switch should handle lightweight branch creation without overcommitting |
| 7 | Switching again before committing anything — dangling edit to in-progress.md | Need a policy for "I touched state files but did no real work on this branch" |
| 8 | Because .meta isn't git-tracked, edits follow you across branches — no isolation | .meta merge is a **prerequisite** for git-based /switch. Chicken-and-egg. |
| 9 | Third switch without writing code. Each time, in-progress.md needs updating manually | High friction for a common real-world pattern (priority reshuffling) |

## Key Insight

**in-progress.md serves two masters:**
1. **Session state** — what am I working on *right now* (volatile, branch-specific)
2. **Project state** — bugs, roadmap, deferred items (durable, shared across branches)

These are colocated in one file. /switch needs to either:
- Split them structurally (separate files or sections with clear ownership)
- Generate the merged view on-demand from branch-specific sources

## Concept: Thread

One philset "thread" per branch, one branch per thread. A thread is the unit of context that /switch saves and restores. Possible names: thread, context, track, lane.

A thread owns:
- Its entry in the "Active" section of in-progress.md
- Its design docs (by reference, not by moving files)
- Its breadcrumbs

A thread does NOT own:
- decisions.md (append-only, shared — merges cleanly if both branches only append)
- The "Known bugs," "Roadmap," "Deferred," "Next up" sections of in-progress.md
- Design docs in other threads

## Design Questions for /draft

1. **Where does thread state live?** Options:
   - Per-branch files (`.meta/threads/feature-foo.md`)
   - Sections within in-progress.md with branch markers
   - A gitignored thread registry that points into committed files

2. **Should /switch handle git operations?** (checkout, branch creation, stash)
   - Pro: single command for the full context switch
   - Con: mixing git plumbing with state management; git worktrees are an alternative
   - Phil leans toward yes, but it's a question for the design session

3. **What happens to in-progress.md on merge?**
   - The thread's Active entry should disappear
   - "Done recently" should get an entry
   - Project-wide sections should merge without conflict

4. **Pre-.meta-merge bootstrap?** Before .meta is tracked, /switch has no git isolation.
   - Could use a gitignored `.meta/threads/` directory as interim solution
   - Or: just require .meta merge as a prerequisite for /switch

5. **What does "park" actually mean?**
   - Minimum: record what branch was active, what the Active entry said
   - Maximum: snapshot the full .meta diff from main, restore on /switch back
   - Middle ground: only snapshot the thread-owned portions

## Success Criteria

- Switching away and back introduces zero merge conflicts in .meta/
- No manual editing of in-progress.md during /switch (the skill handles it)
- Context window preserved (no new conversation needed)
- Works within a single session (multiple switches possible)
- Graceful handling of "switched but did nothing" (no empty commits, no stale state)
