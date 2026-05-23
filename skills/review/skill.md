---
name: review
description: Pre-merge code review. Diffs the session's work against the base branch, runs parallel analysis for efficiency, redundancy, bugs, architecture, and design reconciliation, then presents fixes for approval before committing.
---

# Review

Pre-merge code review. Run this before merging a feature branch or at end-of-session to catch issues while context is fresh.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Flush decisions.md

Before reviewing, ensure any decisions made during conversation are
captured in `decisions.md`. Scan the conversation for decision-like
statements that haven't been logged yet. Append them now — `/review`'s
merge-readiness check depends on `decisions.md` being current.

## Step 2: Scope the work

Determine what to review based on context:

1. **On a feature branch, not yet merged (normal case):** Diff against
   the base branch (usually `main`). Include unstaged and uncommitted
   changes — review everything.

2. **On a feature branch, already merged (forgot to review):** The diff
   against main is empty. Find *this branch's* merge commit and review
   everything that came in with it.

3. **On main, no args:** Review the most recent merge commit — diff
   everything that came in with that merge.

4. **Explicit branch/ref argument** (e.g., `/review feature/junior-work`):
   - If the branch is not yet merged: diff it against main (same as case 1,
     but for a named branch).
   - If the branch is already merged: find its merge commit and diff
     everything that came in with that merge.

Summarize what was touched: files changed, features added, areas modified.
This is your review surface.

## Step 3: Parallel analysis

Launch explore agents in parallel, each focused on the changed files:

1. **Efficiency**: Are there unnecessary allocations, redundant loops, O(n^2) patterns, or things that could be simplified? Look for code that works but could be tighter.

2. **Redundancy**: Is there duplicated logic, copy-pasted patterns that should be extracted, or new code that duplicates something already in the codebase? Check both within the diff and against existing code.

3. **Bugs**: Are there edge cases, off-by-one errors, null/undefined risks, missing error handling at system boundaries, race conditions, or logic errors? Focus on correctness, not style.

4. **Architecture consistency** (only if `.meta/logical-architecture.md` exists): Does the new code match the structure described in `logical-architecture.md`? Check that new files live where the architecture says they should, and that the architecture doc reflects any new modules or structural changes. Where there are inconsistencies, either update logical-architecture.md to point to the new code, or move the new code to the location indicated by logical-architecture.md — use judgment based on which is more correct. If no `logical-architecture.md` exists, skip this dimension.

5. **Design reconciliation** (only if an accepted design doc exists in `designs/` that matches the branch or recent work): Read the design doc and compare against the diff. Categorize each section: implemented as designed, diverged (different but intentional), deferred (in design but not built), or added (built but not in design). Report divergences alongside other findings and suggest reconciliation steps (update the design doc to match what was actually built).

6. **Track reconciliation** (only if a track file exists in `tracks/` matching the current branch): Read each note in the track. Categorize: played (implemented and committed), deferred (sent to roadmap via /defer), unplayed (written but not implemented). Flag unplayed notes — they may indicate forgotten work or scope that was silently dropped. Report alongside other findings.

7. **Merge readiness**: Assess whether `.meta/` state files (decisions.md, in-progress.md) will conflict with the base branch. Check if code merged to main since the branch diverged introduces contradictions — overlapping decisions, conflicting in-progress items, or architectural changes that affect the same areas. Flag contradictory decisions across branches for human resolution.

## Step 4: Present findings

Compile the results into a single summary, organized by severity:

- **Bugs** (must fix): Correctness issues that will cause problems
- **Improvements** (should fix): Efficiency or redundancy issues worth addressing
- **Nits** (optional): Minor things that could be cleaner but aren't urgent

For each finding, show:
- The file and line(s)
- What the issue is
- What the fix would be

If nothing is found, say so — don't invent issues.

## Step 5: Get approval

Present all proposed fixes for review. Wait for approval before making any changes. The user may approve all, some, or none.

## Step 6: Fix and commit

After approval, apply the approved fixes. Commit them **separately from the session's feature work** with a message like:

```
review: fix [brief description of what was fixed]
```

This keeps review fixes distinct from feature commits in git history.

## Step 7: Reconcile the design doc

If a design doc was reconciled in Step 2 (dimension 5), update it in place:

- Add implementation notes to the frontmatter:
  ```markdown
  ---
  Implemented: <today> (<branch>)
  Divergences: <brief summary, or "none">
  Deferred: <items not built, or "none">
  ---
  ```
- For each deferred item, judge disposition: `/defer` to roadmap if it's
  genuine future work, leave in the design doc if it's design-iteration
  scope, or note as intentionally cut
- Log to `decisions.md` if divergences are architecturally significant

Do NOT archive the design doc — designs stay in `designs/` as the current spec until superseded by a newer design (archival happens in `/ship`).

If no design doc was involved, skip this step.

## Step 8: Graduate roadmap items

If `roadmap.md` exists, check whether any items have been completed by
the work under review. For each completed item:

1. Remove it from `roadmap.md`
2. Append it to `archive/rearview.md` (create the file if needed, with
   header: `# Rearview — Completed Roadmap Items`)
3. Add a `Completed: [date] ([branch])` line to the archived entry

If no roadmap items were completed, skip this step.

## Step 9: Archive assessments

If any assessment docs in `assessments/` were consumed during this session's work (i.e., the work addressed gaps or next steps from the assessment), move them to `assessments/archive/` with a date prefix. Assessments are snapshots — once acted on, they belong in the archive.
