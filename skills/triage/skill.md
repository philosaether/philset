---
name: triage
description: Process inbox todo items into the curated roadmap (or resolve them). The triage gate between staging and committed backlog. Use when todo.md has accumulated and needs sorting. Always user-invoked.
---

# Triage

The user typed `/triage` — sort the staging backlog. `todo.md` is the
**inbox for work items** (unordered, untriaged); `roadmap.md` is the
**curated, ordered backlog** (items that have earned a priority). Triage is
the gate between them — the complement to `/defer`.

**State dir convention:** Always write to `.meta/`, creating it (and subdirectories) if needed.

## Step 1: Read the staging backlog

Read `inbox/todo.md` (and surface cross-project provenance where present).
List the open items so the user can see what's on the table.

If `todo.md` is empty or missing, say so and stop — nothing to triage.

## Step 2: Triage each item

Triage is interactive — go item by item, propose a disposition, let the user
confirm or redirect. For each item, the dispositions are:

- **Promote** → move to `roadmap.md`. The roadmap is *ordered* — ask where
  it belongs in priority (or propose a placement). This is the main path:
  "this is real work we'll prioritize."
- **Do-now** → small enough to just knock out this session. Implement it,
  then graduate it (Step 3). Skips the roadmap — promotion is optional
  ceremony only worth it when you want to prioritize against other work.
- **Resolve / discard** → already handled, stale, or superseded. Graduate it
  to rearview (if it was genuine completed work) or just remove it (if it was
  never real).
- **Leave** → still legitimately staging; not ready to commit. Stays in
  `todo.md`.

Match against existing roadmap items before promoting — if the todo item
duplicates something already on the roadmap, merge rather than double-list.

## Step 3: Graduate completed items

For any item that's actually *done* (do-now, or already-handled), follow the
archival convention (`references/archival.md`): append it to
`archive/rearview.md` with a `Completed: <date> (<branch>)` stamp, and remove
it from `todo.md`. Create `archive/rearview.md` on first use with the header
`# Rearview — Completed Items`.

## Step 4: Log & confirm

- Append a one-line `decisions.md` entry summarizing what was promoted,
  done, or resolved (skip if nothing material changed).
- Brief confirmation: counts per disposition (e.g. "3 promoted, 1 done,
  2 resolved, 4 left in staging").

## Note

`/hello` nudges toward `/triage` when `todo.md` grows large — but triage is
never forced. A long staging list is fine; it just means there's sorting
to do when you have the context for it.
